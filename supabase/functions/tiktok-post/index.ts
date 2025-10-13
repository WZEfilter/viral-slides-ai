import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function refreshToken(supabase: any, connectionId: string) {
  const { data: connection } = await supabase
    .from('tiktok_connections')
    .select('*')
    .eq('id', connectionId)
    .single();

  if (!connection) throw new Error('Connection not found');

  const TIKTOK_CLIENT_ID = Deno.env.get('TIKTOK_CLIENT_ID');
  const TIKTOK_CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET');

  const response = await fetch('https://open-api.tiktok.com/oauth/refresh_token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: TIKTOK_CLIENT_ID!,
      grant_type: 'refresh_token',
      refresh_token: connection.refresh_token,
    }),
  });

  const data = await response.json();

  if (data.data) {
    const { access_token, refresh_token, expires_in } = data.data;
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    await supabase
      .from('tiktok_connections')
      .update({
        access_token,
        refresh_token,
        token_expires_at: expiresAt,
      })
      .eq('id', connectionId);

    return access_token;
  }

  throw new Error('Failed to refresh token');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { connectionId, contentUrls, caption, privacy, type } = await req.json();

    console.log('Posting to TikTok:', { connectionId, type, privacy });

    // Reset daily counter if needed
    await supabase.rpc('reset_tiktok_counters');

    // Get connection
    const { data: connection, error: connError } = await supabase
      .from('tiktok_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (connError || !connection) {
      throw new Error('Connection not found');
    }

    // Check rate limit
    if (connection.daily_post_count >= 15) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded',
        message: `@${connection.username} has reached daily limit (15/15)`,
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Refresh token if expired or expiring soon (within 1 hour)
    let accessToken = connection.access_token;
    const expiresAt = new Date(connection.token_expires_at);
    if (expiresAt.getTime() - Date.now() < 3600000) {
      console.log('Refreshing token');
      accessToken = await refreshToken(supabase, connectionId);
    }

    // Upload content to TikTok
    // This is a simplified version - actual TikTok API requires multiple steps
    const uploadResponse = await fetch('https://open-api.tiktok.com/share/video/upload/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: type === 'video' ? contentUrls[0] : null,
        image_urls: type === 'image' ? contentUrls : null,
        caption,
        privacy_level: privacy === 'public' ? 'PUBLIC_TO_EVERYONE' : 'SELF_ONLY',
      }),
    });

    if (!uploadResponse.ok) {
      throw new Error(`TikTok upload failed: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();

    // Increment post counter
    await supabase
      .from('tiktok_connections')
      .update({
        daily_post_count: connection.daily_post_count + 1,
      })
      .eq('id', connectionId);

    console.log('Posted successfully to', connection.username);

    return new Response(JSON.stringify({
      success: true,
      postUrl: uploadData.share_url || null,
      username: connection.username,
      postsToday: connection.daily_post_count + 1,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in tiktok-post:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
