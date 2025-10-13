import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // Contains user_id

    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }

    const TIKTOK_CLIENT_ID = Deno.env.get('TIKTOK_CLIENT_ID');
    const TIKTOK_CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET');

    if (!TIKTOK_CLIENT_ID || !TIKTOK_CLIENT_SECRET) {
      throw new Error('TikTok credentials not configured');
    }

    console.log('Exchanging code for tokens');

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_ID,
        client_secret: TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`TikTok OAuth error: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.data) {
      const { access_token, refresh_token, expires_in, open_id } = tokenData.data;

      // Get user info
      const userInfoResponse = await fetch(`https://open-api.tiktok.com/user/info/?access_token=${access_token}&open_id=${open_id}`, {
        method: 'GET',
      });

      const userInfo = await userInfoResponse.json();
      const username = userInfo.data?.user?.display_name || 'Unknown';
      const avatarUrl = userInfo.data?.user?.avatar_url || null;

      // Calculate token expiration time
      const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

      // Store in database
      const { data, error } = await supabase
        .from('tiktok_connections')
        .insert({
          user_id: state, // state contains the user_id
          access_token,
          refresh_token,
          token_expires_at: expiresAt,
          username,
          avatar_url: avatarUrl,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('TikTok account connected:', username);

      // Redirect back to app
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${Deno.env.get('SUPABASE_URL')}/dashboard?tiktok=connected`,
        },
      });
    } else {
      throw new Error('No token data received');
    }
  } catch (error) {
    console.error('Error in tiktok-oauth:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
