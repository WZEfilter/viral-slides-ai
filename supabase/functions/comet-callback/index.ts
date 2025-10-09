// Edge Function: comet-callback
// Purpose: Handle Comet video generation callbacks

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { downloadVideo, uploadVideoToStorage } from '../_shared/comet.ts';
import { sendGenerationFailedEmail } from '../_shared/email.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify webhook secret (supports both header and query param)
    const expectedSecret = (Deno.env.get('COMET_WEBHOOK_SECRET') || Deno.env.get('MIDJOURNEY_WEBHOOK_SECRET') || '').trim();
    if (expectedSecret) {
      const url = new URL(req.url);
      const tokenParam = (url.searchParams.get('token') || '').trim();
      const headerSecret = (req.headers.get('X-Webhook-Secret') || req.headers.get('x-webhook-secret') || '').trim();
      const providedSecret = headerSecret || tokenParam;

      if (providedSecret !== expectedSecret) {
        console.error('[Comet-Callback] Unauthorized: Invalid webhook secret');
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401
          }
        );
      }
    }

    // Parse URL params
    const url = new URL(req.url);
    const generationId = url.searchParams.get('generation_id');

    if (!generationId) {
      throw new Error('Missing generation_id parameter');
    }

    // Parse callback body
    const body = await req.json();
    const { status, video_url, error, task_id } = body;

    console.log(`Comet callback received for generation ${generationId}:`, {
      status,
      has_video_url: !!video_url,
      error,
    });

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch generation
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .single();

    if (genError || !generation) {
      throw new Error('Generation not found');
    }

    // Handle failure
    if (status !== 'success' || !video_url) {
      console.error('Video generation failed:', error);

      // Mark as failed
      await supabase
        .from('generations')
        .update({
          status: 'failed',
          error_message: error || 'Comet video generation failed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', generationId);

      // Refund credits
      await supabase.rpc('refund_credits', {
        p_user_id: generation.user_id,
        p_amount: generation.credits_used,
        p_reason: 'Video generation failed',
        p_generation_id: generationId,
      });

      // Send failure email
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', generation.user_id)
        .single();

      if (user?.email) {
        await sendGenerationFailedEmail(
          user.email,
          'video',
          generation.metadata?.scenario_title || 'Live Wallpaper',
          generation.credits_used,
          error || 'Video generation failed'
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: error || 'Generation failed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log('Video generation successful, downloading base video...');

    // Download 5-second base video from Comet CDN
    const downloadResult = await downloadVideo(video_url);

    if (!downloadResult.success || !downloadResult.videoData) {
      console.error('Failed to download video:', downloadResult.error);

      // Mark as failed
      await supabase
        .from('generations')
        .update({
          status: 'failed',
          error_message: `Failed to download video: ${downloadResult.error}`,
          completed_at: new Date().toISOString(),
        })
        .eq('id', generationId);

      // Refund credits
      await supabase.rpc('refund_credits', {
        p_user_id: generation.user_id,
        p_amount: generation.credits_used,
        p_reason: 'Video download failed',
        p_generation_id: generationId,
      });

      return new Response(
        JSON.stringify({ success: false, error: downloadResult.error }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('Video downloaded successfully, uploading to storage...');

    // Upload base video to Supabase Storage
    // Path: videos/{user_id}/{generation_id}/base.mp4
    const basePath = `${generation.user_id}/${generationId}/base.mp4`;

    const uploadResult = await uploadVideoToStorage(
      supabase,
      downloadResult.videoData,
      basePath,
      'videos'
    );

    if (!uploadResult.success) {
      console.error('Failed to upload video:', uploadResult.error);

      await supabase
        .from('generations')
        .update({
          status: 'failed',
          error_message: `Failed to upload video: ${uploadResult.error}`,
          completed_at: new Date().toISOString(),
        })
        .eq('id', generationId);

      // Refund credits
      await supabase.rpc('refund_credits', {
        p_user_id: generation.user_id,
        p_amount: generation.credits_used,
        p_reason: 'Video upload failed',
        p_generation_id: generationId,
      });

      return new Response(
        JSON.stringify({ success: false, error: uploadResult.error }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('Base video uploaded successfully:', uploadResult.publicUrl);

    // Update generation - mark as needs stitching
    // Frontend will pick this up and use FFmpeg.wasm to stitch 13 loops
    await supabase
      .from('generations')
      .update({
        status: 'needs_stitching',
        metadata: {
          ...generation.metadata,
          base_video_url: uploadResult.publicUrl,
          comet_video_url: video_url,
          base_downloaded_at: new Date().toISOString(),
        },
      })
      .eq('id', generationId);

    console.log('Generation updated to needs_stitching status');

    // Frontend will now:
    // 1. Detect needs_stitching status
    // 2. Download base video
    // 3. Use FFmpeg.wasm to stitch 13 loops (65 seconds)
    // 4. Upload final video
    // 5. Call complete-video-generation endpoint

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Base video ready for stitching',
        generation_id: generationId,
        base_video_url: uploadResult.publicUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Comet callback error:', error);

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
