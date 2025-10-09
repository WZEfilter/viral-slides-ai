// Edge Function: auth-tiktok-callback
// Purpose: Handle TikTok OAuth callback, exchange code for tokens, store connection
// Deno runtime

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TIKTOK_CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY')!;
const TIKTOK_CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';

const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_USER_INFO_URL = 'https://open.tiktokapis.com/v2/user/info/';

interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds (86400 = 24 hours)
  refresh_expires_in: number; // seconds (31536000 = 365 days)
  open_id: string;
  scope: string;
  token_type: string;
}

interface TikTokUserInfoResponse {
  data: {
    user: {
      open_id: string;
      union_id: string;
      avatar_url: string;
      display_name: string;
    };
  };
  error: {
    code: string;
    message: string;
  };
}

// Simple encryption using Web Crypto API
async function encrypt(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // In production, use a proper encryption key from Supabase Vault
  // For now, we'll use base64 encoding (NOT SECURE - placeholder)
  // TODO: Implement proper encryption with Supabase Vault
  return btoa(text);
}

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': APP_URL,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { code, state, code_verifier, error: oauthError } = await req.json();

    // Check for OAuth errors from TikTok
    if (oauthError) {
      throw new Error(`TikTok OAuth error: ${oauthError}`);
    }

    if (!code) {
      throw new Error('Missing authorization code');
    }

    if (!code_verifier) {
      throw new Error('Missing code_verifier for PKCE');
    }

    // Exchange authorization code for tokens with PKCE
    const tokenResponse = await fetch(TIKTOK_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${APP_URL}/auth/tiktok/callback`,
        code_verifier: code_verifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('TikTok token exchange failed:', {
        status: tokenResponse.status,
        error: errorText,
        client_key: TIKTOK_CLIENT_KEY,
        redirect_uri: `${APP_URL}/auth/tiktok/callback`,
      });
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData: TikTokTokenResponse = await tokenResponse.json();

    // Fetch user info from TikTok
    const userInfoResponse = await fetch(TIKTOK_USER_INFO_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info from TikTok');
    }

    const userInfoData: TikTokUserInfoResponse = await userInfoResponse.json();

    if (userInfoData.error) {
      throw new Error(`TikTok API error: ${userInfoData.error.message}`);
    }

    const tiktokUser = userInfoData.data.user;

    // Encrypt tokens before storing
    const encryptedAccessToken = await encrypt(tokenData.access_token);
    const encryptedRefreshToken = await encrypt(tokenData.refresh_token);

    // Calculate token expiry times
    const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Check if user already exists in our users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    // Create user record if it doesn't exist
    if (!existingUser) {
      const { error: insertUserError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          created_at: new Date().toISOString(),
        });

      if (insertUserError) {
        console.error('Error creating user:', insertUserError);
        throw new Error('Failed to create user record');
      }
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('tiktok_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('tiktok_user_id', tiktokUser.open_id)
      .single();

    let connectionId: string;

    if (existingConnection) {
      // Update existing connection
      const { data: updated, error: updateError } = await supabase
        .from('tiktok_connections')
        .update({
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt.toISOString(),
          connection_status: 'active',
          tiktok_username: tiktokUser.display_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConnection.id)
        .select('id')
        .single();

      if (updateError) {
        throw new Error(`Failed to update connection: ${updateError.message}`);
      }

      connectionId = updated.id;
    } else {
      // Create new connection
      const { data: inserted, error: insertError } = await supabase
        .from('tiktok_connections')
        .insert({
          user_id: user.id,
          tiktok_user_id: tiktokUser.open_id,
          tiktok_username: tiktokUser.display_name,
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt.toISOString(),
          connection_status: 'active',
          daily_post_count: 0,
          minute_post_count: 0,
          last_minute_reset: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError) {
        throw new Error(`Failed to create connection: ${insertError.message}`);
      }

      connectionId = inserted.id;
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        connection_id: connectionId,
        username: tiktokUser.display_name,
        avatar_url: tiktokUser.avatar_url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('TikTok OAuth callback error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
