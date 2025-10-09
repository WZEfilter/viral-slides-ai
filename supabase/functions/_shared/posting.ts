/**
 * TikTok Posting Configuration Module
 * Handles posting decisions and triggers
 *
 * Best Practices:
 * - Centralized posting configuration
 * - Feature flag support
 * - Graceful degradation when posting disabled
 * - Comprehensive logging
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Global feature flag for TikTok posting
// Set to false during development/testing
const POSTING_ENABLED = Deno.env.get('TIKTOK_POSTING_ENABLED') === 'true';

export interface PostingDecision {
  shouldPost: boolean;
  reason: string;
  tiktokAccountIds?: string[];
}

export interface PostingContext {
  generationId: string;
  scenarioId: string;
  userId: string;
  generationType: 'image' | 'video';
  contentUrls: string[]; // Image URLs or final video URL
  caption: string;
}

/**
 * Determine if a generation should be posted to TikTok
 *
 * Decision factors:
 * 1. Global feature flag (TIKTOK_POSTING_ENABLED)
 * 2. Scenario auto_post_enabled setting
 * 3. TikTok account availability
 * 4. Rate limits
 * 5. API health
 */
export async function shouldPostToTikTok(
  supabase: SupabaseClient,
  context: PostingContext
): Promise<PostingDecision> {
  try {
    // Check 1: Global feature flag
    if (!POSTING_ENABLED) {
      console.log('[Posting] Global posting disabled (TIKTOK_POSTING_ENABLED=false)');
      return {
        shouldPost: false,
        reason: 'Global posting feature disabled',
      };
    }

    // Check 2: Fetch scenario settings
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('auto_post_enabled, tiktok_account_ids')
      .eq('id', context.scenarioId)
      .single();

    if (scenarioError || !scenario) {
      console.error('[Posting] Failed to fetch scenario:', scenarioError);
      return {
        shouldPost: false,
        reason: 'Scenario not found',
      };
    }

    if (!scenario.auto_post_enabled) {
      console.log('[Posting] Scenario auto_post_enabled is false');
      return {
        shouldPost: false,
        reason: 'Scenario has auto-posting disabled',
      };
    }

    // Check 3: Validate TikTok accounts
    const accountIds = scenario.tiktok_account_ids || [];

    if (accountIds.length === 0) {
      console.log('[Posting] No TikTok accounts linked to scenario');
      return {
        shouldPost: false,
        reason: 'No TikTok accounts configured',
      };
    }

    // Check 4: Verify accounts are connected and valid
    const { data: accounts, error: accountsError } = await supabase
      .from('tiktok_connections')
      .select('id, status, daily_post_count')
      .eq('user_id', context.userId)
      .in('id', accountIds);

    if (accountsError || !accounts || accounts.length === 0) {
      console.log('[Posting] No valid TikTok accounts found');
      return {
        shouldPost: false,
        reason: 'No connected TikTok accounts',
      };
    }

    // Filter to active accounts under rate limit
    const validAccounts = accounts.filter(
      (acc) => acc.status === 'connected' && acc.daily_post_count < 15
    );

    if (validAccounts.length === 0) {
      console.log('[Posting] All accounts are either disconnected or rate-limited');
      return {
        shouldPost: false,
        reason: 'All TikTok accounts are disconnected or rate-limited',
      };
    }

    // Check 5: API health (optional - can add later)
    // For now, assume API is healthy

    // All checks passed
    console.log(`[Posting] Should post: YES (${validAccounts.length} valid accounts)`);
    return {
      shouldPost: true,
      reason: 'All posting conditions met',
      tiktokAccountIds: validAccounts.map((acc) => acc.id),
    };
  } catch (error) {
    console.error('[Posting] Decision error:', error);
    return {
      shouldPost: false,
      reason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Trigger TikTok posting for a completed generation
 *
 * This function decides whether to post, then triggers the post-to-tiktok edge function
 * if appropriate. Uses async fire-and-forget pattern for non-blocking execution.
 */
export async function triggerPosting(
  supabase: SupabaseClient,
  context: PostingContext
): Promise<{ triggered: boolean; reason: string }> {
  try {
    const decision = await shouldPostToTikTok(supabase, context);

    if (!decision.shouldPost) {
      console.log(`[Posting] Skipping post: ${decision.reason}`);

      // Update generation metadata with decision
      await supabase
        .from('generations')
        .update({
          metadata: {
            posting_skipped: true,
            posting_skip_reason: decision.reason,
            posting_checked_at: new Date().toISOString(),
          },
        })
        .eq('id', context.generationId);

      return {
        triggered: false,
        reason: decision.reason,
      };
    }

    console.log('[Posting] Triggering post to TikTok...');

    // Call post-to-tiktok edge function (fire-and-forget)
    // Don't await - let it run asynchronously
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Fire and forget - don't block on posting
    fetch(`${SUPABASE_URL}/functions/v1/post-to-tiktok`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        generation_id: context.generationId,
        scenario_id: context.scenarioId,
        user_id: context.userId,
        tiktok_account_ids: decision.tiktokAccountIds,
        content_urls: context.contentUrls,
        caption: context.caption,
        generation_type: context.generationType,
      }),
    }).catch((error) => {
      console.error('[Posting] Trigger error:', error);
    });

    // Update generation metadata
    await supabase
      .from('generations')
      .update({
        metadata: {
          posting_triggered: true,
          posting_triggered_at: new Date().toISOString(),
          posting_account_ids: decision.tiktokAccountIds,
        },
      })
      .eq('id', context.generationId);

    console.log('[Posting] Post trigger sent successfully');

    return {
      triggered: true,
      reason: 'Posting initiated',
    };
  } catch (error) {
    console.error('[Posting] Trigger error:', error);
    return {
      triggered: false,
      reason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get current posting configuration status
 * Useful for debugging and status endpoints
 */
export function getPostingConfig(): {
  globalEnabled: boolean;
  environment: string;
} {
  return {
    globalEnabled: POSTING_ENABLED,
    environment: Deno.env.get('DENO_ENV') || 'production',
  };
}
