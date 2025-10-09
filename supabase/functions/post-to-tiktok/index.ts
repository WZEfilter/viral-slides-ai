// Edge Function: post-to-tiktok
// Purpose: Post completed generation to TikTok (STUB - Not fully implemented)
//
// Status: Phase 5 - Blocked by TikTok app approval
// Current: Logs posting requests, stores posting_logs, but doesn't actually post
//
// TODO for Phase 5:
// - Implement TikTok Direct Post API integration
// - Add token refresh logic
// - Add rate limit enforcement
// - Add retry logic
// - Handle posting errors

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TIKTOK_API_ENABLED = Deno.env.get('TIKTOK_POSTING_ENABLED') === 'true';

interface PostingRequest {
  generation_id: string;
  scenario_id: string;
  user_id: string;
  tiktok_account_ids: string[];
  content_urls: string[];
  caption: string;
  generation_type: 'image' | 'video';
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request
    const body: PostingRequest = await req.json();
    const {
      generation_id,
      scenario_id,
      user_id,
      tiktok_account_ids,
      content_urls,
      caption,
      generation_type,
    } = body;

    console.log(`[Post-to-TikTok] Request received for generation ${generation_id}`);
    console.log(`[Post-to-TikTok] Type: ${generation_type}, Accounts: ${tiktok_account_ids.length}`);

    // Check if TikTok posting is enabled
    if (!TIKTOK_API_ENABLED) {
      console.log('[Post-to-TikTok] TikTok posting is disabled (TIKTOK_POSTING_ENABLED=false)');

      // Log as skipped
      for (const accountId of tiktok_account_ids) {
        await supabase.from('posting_logs').insert({
          generation_id,
          tiktok_account_id: accountId,
          status: 'skipped',
          error_message: 'TikTok posting disabled in environment',
          attempted_at: new Date().toISOString(),
        });
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: 'TikTok posting disabled',
          skipped_accounts: tiktok_account_ids.length,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // STUB: This is where the actual TikTok posting logic will go in Phase 5
    console.log('[Post-to-TikTok] STUB MODE - Not posting to TikTok');
    console.log('[Post-to-TikTok] Would post:', {
      generation_type,
      content_urls: content_urls.length,
      caption: caption.substring(0, 50) + '...',
      accounts: tiktok_account_ids.length,
    });

    // For now, just log the posting attempts as 'pending'
    // In Phase 5, this will actually call TikTok API
    const postingResults = [];

    for (const accountId of tiktok_account_ids) {
      // STUB: In Phase 5, call TikTok Direct Post API here
      // const tiktokResult = await postToTikTokAPI(accountId, content_urls, caption);

      // For now, create a pending posting log
      const { data: log, error: logError } = await supabase
        .from('posting_logs')
        .insert({
          generation_id,
          tiktok_account_id: accountId,
          status: 'pending',
          error_message: 'Stub mode - TikTok API not implemented',
          attempted_at: new Date().toISOString(),
          metadata: {
            stub_mode: true,
            content_urls,
            caption,
            generation_type,
          },
        })
        .select()
        .single();

      if (logError) {
        console.error('[Post-to-TikTok] Failed to create posting log:', logError);
        postingResults.push({
          account_id: accountId,
          success: false,
          error: logError.message,
        });
      } else {
        console.log(`[Post-to-TikTok] Created posting log for account ${accountId}`);
        postingResults.push({
          account_id: accountId,
          success: true,
          posting_log_id: log.id,
          stub_mode: true,
        });
      }
    }

    // Update generation metadata
    await supabase
      .from('generations')
      .update({
        metadata: {
          posting_attempted: true,
          posting_attempted_at: new Date().toISOString(),
          posting_stub_mode: true,
          posting_results: postingResults,
        },
      })
      .eq('id', generation_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Posting logged (stub mode)',
        stub_mode: true,
        results: postingResults,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Post-to-TikTok] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// TODO for Phase 5: Implement these functions
// async function postToTikTokAPI(accountId, contentUrls, caption) { ... }
// async function refreshTokenIfNeeded(accountId) { ... }
// async function checkRateLimits(accountId) { ... }
