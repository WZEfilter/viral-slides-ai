// Edge Function: complete-video-generation
// Purpose: Mark video generation as complete after frontend stitches with FFmpeg.wasm

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendGenerationCompleteEmail } from '../_shared/email.ts';
import { triggerPosting } from '../_shared/posting.ts';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req);
  }

  try {
    // Get authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request
    const { generation_id, final_video_url } = await req.json();

    if (!generation_id || !final_video_url) {
      throw new Error('Missing generation_id or final_video_url');
    }

    console.log(`Completing video generation ${generation_id}`);

    // Fetch generation
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .select('*')
      .eq('id', generation_id)
      .eq('user_id', user.id) // Ensure user owns this generation
      .single();

    if (genError || !generation) {
      throw new Error('Generation not found or unauthorized');
    }

    // Verify it's in needs_stitching status
    if (generation.status !== 'needs_stitching') {
      throw new Error(`Invalid status: ${generation.status}. Expected needs_stitching`);
    }

    console.log('Marking generation as completed...');

    // Update generation to completed
    await supabase
      .from('generations')
      .update({
        status: 'generated',
        video_url: final_video_url,
        completed_at: new Date().toISOString(),
        metadata: {
          ...generation.metadata,
          stitched_at: new Date().toISOString(),
          final_video_url,
        },
      })
      .eq('id', generation_id);

    console.log('Generation marked as completed');

    // Get user email for notification
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single();

    // Send completion email
    if (userData?.email) {
      await sendGenerationCompleteEmail(
        userData.email,
        'video',
        generation.metadata?.scenario_title || 'Live Wallpaper',
        generation_id
      );
      console.log('Completion email sent');
    }

    // Trigger TikTok posting if enabled (non-blocking)
    const postingResult = await triggerPosting(supabase, {
      generationId: generation_id,
      scenarioId: generation.scenario_id,
      userId: generation.user_id,
      generationType: 'video',
      contentUrls: [final_video_url],
      caption: generation.caption || '',
    });

    console.log(`[Complete-Video] Posting ${postingResult.triggered ? 'triggered' : 'skipped'}: ${postingResult.reason}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Video generation completed',
        generation_id,
        video_url: final_video_url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Complete video generation error:', error);

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
