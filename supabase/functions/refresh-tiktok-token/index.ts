// Edge Function: refresh-tiktok-token
// Purpose: Refresh TikTok access token using refresh token
// Deno runtime

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TIKTOK_CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY')!;
const TIKTOK_CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';

const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';

interface TikTokRefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  open_id: string;
  scope: string;
  token_type: string;
}

// Simple decryption (matches encryption in callback)
async function decrypt(encryptedText: string): Promise<string> {
  // TODO: Implement proper decryption with Supabase Vault
  return atob(encryptedText);
}

// Simple encryption
async function encrypt(text: string): Promise<string> {
  // TODO: Implement proper encryption with Supabase Vault
  return btoa(text);
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': APP_URL,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get connection_id from request
    const { connection_id } = await req.json();

    if (!connection_id) {
      throw new Error('Missing connection_id');
    }

    // Fetch connection from database
    const { data: connection, error: fetchError } = await supabase
      .from('tiktok_connections')
      .select('*')
      .eq('id', connection_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !connection) {
      throw new Error('Connection not found');
    }

    // Check if token needs refresh (refresh if expires in next 2 hours)
    const expiresAt = new Date(connection.token_expires_at);
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);

    if (expiresAt > twoHoursFromNow) {
      // Token is still valid, no need to refresh
      return new Response(
        JSON.stringify({
          success: true,
          refreshed: false,
          message: 'Token is still valid',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Decrypt refresh token
    const refreshToken = await decrypt(connection.refresh_token);

    // Request new tokens from TikTok
    const refreshResponse = await fetch(TIKTOK_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();

      // Mark connection as expired
      await supabase
        .from('tiktok_connections')
        .update({ connection_status: 'expired' })
        .eq('id', connection_id);

      throw new Error(`Token refresh failed: ${errorText}`);
    }

    const refreshData: TikTokRefreshResponse = await refreshResponse.json();

    // Encrypt new tokens
    const encryptedAccessToken = await encrypt(refreshData.access_token);
    const encryptedRefreshToken = await encrypt(refreshData.refresh_token);

    // Calculate new expiry
    const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000);

    // Update connection in database
    const { error: updateError } = await supabase
      .from('tiktok_connections')
      .update({
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: newExpiresAt.toISOString(),
        connection_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection_id);

    if (updateError) {
      throw new Error(`Failed to update tokens: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        refreshed: true,
        expires_at: newExpiresAt.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Token refresh error:', error);

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
