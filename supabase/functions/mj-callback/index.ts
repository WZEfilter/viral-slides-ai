// Edge Function: mj-callback
// Purpose: Handle MidJourney image generation callbacks from Kie.ai

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { downloadAndUploadImage } from '../_shared/kieai.ts';
import { sendGenerationCompleteEmail, sendGenerationFailedEmail } from '../_shared/email.ts';
import { triggerPosting } from '../_shared/posting.ts';

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
    // Parse URL params
    const url = new URL(req.url);
    const generationId = url.searchParams.get('generation_id');
    const imageIndex = parseInt(url.searchParams.get('image_index') || '0');

    console.log(`[MJ-Callback] Received callback for generation ${generationId}, image ${imageIndex}`);

    if (!generationId) {
      throw new Error('Missing generation_id parameter');
    }

    // Parse callback body
    const body = await req.json();
    const { status, image_url, error, request_id } = body;

    console.log(`Callback received for generation ${generationId}, image ${imageIndex}:`, {
      status,
      has_image_url: !!image_url,
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

    // Get current metadata
    const metadata = generation.metadata || {};
    const imageResults = metadata.image_results || [];

    // Handle success
    if (status === 'success' && image_url) {
      console.log(`Processing successful image ${imageIndex}...`);

      // Download from Kie.ai and upload to Supabase Storage
      const storagePath = `${generation.user_id}/${generationId}/${imageIndex}.png`;

      const uploadResult = await downloadAndUploadImage(
        image_url,
        supabase,
        storagePath
      );

      if (uploadResult.success) {
        console.log(`Image ${imageIndex} uploaded successfully`);

        // Update results
        imageResults[imageIndex] = {
          index: imageIndex,
          status: 'generated',
          image_url: uploadResult.publicUrl,
          kie_url: image_url,
          completed_at: new Date().toISOString(),
        };
      } else {
        console.error(`Image ${imageIndex} upload failed:`, uploadResult.error);

        imageResults[imageIndex] = {
          index: imageIndex,
          status: 'failed',
          error: uploadResult.error,
          completed_at: new Date().toISOString(),
        };
      }
    } else {
      // Handle failure
      console.error(`Image ${imageIndex} generation failed:`, error);

      imageResults[imageIndex] = {
        index: imageIndex,
        status: 'failed',
        error: error || 'Unknown error',
        completed_at: new Date().toISOString(),
      };
    }

    // Update generation metadata
    await supabase
      .from('generations')
      .update({
        metadata: {
          ...metadata,
          image_results: imageResults,
          last_callback_at: new Date().toISOString(),
        },
      })
      .eq('id', generationId);

    // Check if all images are complete
    const totalImages = generation.metadata?.image_count || imageResults.length;
    const completedCount = imageResults.filter((r: any) => r?.status === 'completed').length;
    const failedCount = imageResults.filter((r: any) => r?.status === 'failed').length;
    const processedCount = completedCount + failedCount;

    console.log(`Progress: ${processedCount}/${totalImages} (${completedCount} success, ${failedCount} failed)`);

    // If all images processed
    if (processedCount >= totalImages) {
      console.log('All images processed, finalizing generation...');

      // Get user email for notifications
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', generation.user_id)
        .single();

      // If all succeeded
      if (failedCount === 0) {
        console.log('All images successful!');

        // Update generation status
        await supabase
          .from('generations')
          .update({
            status: 'generated',
            image_urls: imageResults.map((r: any) => r.image_url),
            completed_at: new Date().toISOString(),
          })
          .eq('id', generationId);

        // Send success email
        if (user?.email) {
          await sendGenerationCompleteEmail(
            user.email,
            'image',
            generation.metadata?.scenario_title || 'Image Slideshow',
            generationId
          );
        }

        // Trigger TikTok posting if enabled (non-blocking)
        const postingResult = await triggerPosting(supabase, {
          generationId,
          scenarioId: generation.scenario_id,
          userId: generation.user_id,
          generationType: 'image',
          contentUrls: imageResults.map((r: any) => r.image_url),
          caption: generation.caption || '',
        });

        console.log(`[MJ-Callback] Posting ${postingResult.triggered ? 'triggered' : 'skipped'}: ${postingResult.reason}`);
      } else if (completedCount > 0) {
        // Partial success
        console.log(`Partial success: ${completedCount}/${totalImages} images completed`);

        // Mark as completed with warnings
        await supabase
          .from('generations')
          .update({
            status: 'generated',
            image_urls: imageResults
              .filter((r: any) => r?.status === 'completed')
              .map((r: any) => r.image_url),
            completed_at: new Date().toISOString(),
            error_message: `${failedCount} images failed to generate`,
          })
          .eq('id', generationId);

        // Refund credits for failed images
        const creditsToRefund = failedCount; // 1 credit per image
        await supabase.rpc('refund_credits', {
          p_user_id: generation.user_id,
          p_amount: creditsToRefund,
          p_reason: `${failedCount} images failed`,
          p_generation_id: generationId,
        });

        console.log(`Refunded ${creditsToRefund} credits for failed images`);
      } else {
        // All failed
        console.log('All images failed');

        await supabase
          .from('generations')
          .update({
            status: 'failed',
            error_message: 'All images failed to generate',
            completed_at: new Date().toISOString(),
          })
          .eq('id', generationId);

        // Refund all credits
        await supabase.rpc('refund_credits', {
          p_user_id: generation.user_id,
          p_amount: generation.credits_used,
          p_reason: 'All images failed',
          p_generation_id: generationId,
        });

        // Send failure email
        if (user?.email) {
          await sendGenerationFailedEmail(
            user.email,
            'image',
            generation.metadata?.scenario_title || 'Image Slideshow',
            generation.credits_used,
            'All images failed to generate'
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Callback processed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Callback processing error:', error);

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
