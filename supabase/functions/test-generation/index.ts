// Edge Function: test-generation
// Purpose: Test generation flow WITHOUT deducting credits or requiring TikTok accounts
//
// This is a testing-only endpoint with fixed prompts for:
// - Image generation (6 images via Kie.ai MidJourney)
// - Video generation (65-second video via Comet Seedance)
//
// Key differences from production:
// - NO credit deduction
// - NO TikTok account requirement
// - Uses fixed test prompts
// - Creates generation record with is_test: true flag
// - Skips all validation except authentication

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { expandImagePrompts, expandVideoPrompt, createFallbackImagePrompts, createFallbackVideoPrompt } from '../_shared/openai.ts';
import { generateImage } from '../_shared/kieai.ts';
import { generateVideo } from '../_shared/comet.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// CORS helper
function getCorsHeaders(origin: string | null) {
  const allowedOrigins = [
    'https://viralslides.ai',
    'https://www.viralslides.ai',
    'http://localhost:5173',
  ];

  const allowedOrigin = origin && allowedOrigins.includes(origin)
    ? origin
    : 'https://viralslides.ai';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Fixed test prompts
const TEST_PROMPTS = {
  image: 'A serene Japanese garden with cherry blossoms, koi pond, and traditional stone lanterns at sunset',
  video: 'Gentle waves on a tropical beach with palm trees swaying in the breeze, golden hour lighting',
};

interface TestGenerationRequest {
  type: 'image' | 'video';
  use_openai_expansion?: boolean; // Default: true
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('Origin'));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get authorization (still require user to be logged in)
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
    const body: TestGenerationRequest = await req.json();
    const { type, use_openai_expansion = true } = body;

    if (!type || !['image', 'video'].includes(type)) {
      throw new Error('Invalid type. Must be "image" or "video"');
    }

    console.log(`[Test-Generation] Testing ${type} generation for user ${user.id}`);
    console.log(`[Test-Generation] OpenAI expansion: ${use_openai_expansion}`);

    const basePrompt = TEST_PROMPTS[type];

    // Handle image generation
    if (type === 'image') {
      const imageCount = 6;

      // Expand prompts (optional)
      let prompts: string[];
      let caption: string;

      if (use_openai_expansion) {
        try {
          const expandResult = await expandImagePrompts(basePrompt, imageCount);
          if (expandResult) {
            prompts = expandResult.prompts;
            caption = expandResult.caption;
            console.log('[Test-Generation] OpenAI expansion successful');
          } else {
            const fallback = createFallbackImagePrompts(basePrompt, imageCount);
            prompts = fallback.prompts;
            caption = fallback.caption;
            console.log('[Test-Generation] Using fallback prompts');
          }
        } catch (error) {
          console.error('[Test-Generation] OpenAI expansion error:', error);
          const fallback = createFallbackImagePrompts(basePrompt, imageCount);
          prompts = fallback.prompts;
          caption = fallback.caption;
        }
      } else {
        const fallback = createFallbackImagePrompts(basePrompt, imageCount);
        prompts = fallback.prompts;
        caption = fallback.caption;
      }

      // Create test generation record (NO scenario_id, NO credit deduction)
      const { data: generation, error: genError } = await supabase
        .from('generations')
        .insert({
          user_id: user.id,
          scenario_id: null, // No scenario for tests
          type: 'image',
          status: 'generating',
          prompts_used: prompts,
          caption: caption,
          credits_used: 0, // NO CREDITS DEDUCTED
          ai_model: 'mj_v7',
          metadata: {
            is_test: true, // Flag for filtering
            test_mode: true,
            image_count: imageCount,
            base_prompt: basePrompt,
            openai_expansion_used: use_openai_expansion,
          },
        })
        .select()
        .single();

      if (genError || !generation) {
        throw new Error(`Failed to create generation record: ${genError?.message}`);
      }

      console.log(`[Test-Generation] Test generation created: ${generation.id}`);

      // Submit to Kie.ai with callback to Vercel proxy (bypasses Supabase auth)
      // Vercel function will forward to Supabase with proper authentication
      const vercelUrl = Deno.env.get('VERCEL_URL') || 'https://www.viralslides.ai';
      const webhookSecret = Deno.env.get('MIDJOURNEY_WEBHOOK_SECRET') || '';
      const callbackUrl = `${vercelUrl}/api/mj-callback?generation_id=${generation.id}&token=${encodeURIComponent(webhookSecret)}`;
      const submissionResults = [];

      console.log(`[Test-Generation] Submitting ${prompts.length} images to Kie.ai`);

      for (let i = 0; i < prompts.length; i++) {
        console.log(`[Test-Generation] Submitting image ${i + 1}/${prompts.length} to Kie.ai`);

        const result = await generateImage({
          prompt: prompts[i],
          callbackUrl: `${callbackUrl}&image_index=${i}`,
          aspectRatio: '9:16',
          model: 'mj_v7',
        });

        console.log(`[Test-Generation] Image ${i} result:`, JSON.stringify(result));

        submissionResults.push({
          index: i,
          success: result.success,
          request_id: result.request_id,
          error: result.error,
        });

        if (!result.success) {
          console.error(`[Test-Generation] Image ${i} submission failed:`, result.error);
        }
      }

      // Update generation with submission results
      await supabase
        .from('generations')
        .update({
          metadata: {
            ...generation.metadata,
            submission_results: submissionResults,
            submitted_at: new Date().toISOString(),
          },
        })
        .eq('id', generation.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test image generation started (NO credits deducted)',
          generation_id: generation.id,
          type: 'image',
          image_count: imageCount,
          prompts: prompts,
          caption: caption,
          credits_deducted: 0,
          is_test: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Handle video generation
    if (type === 'video') {
      // Expand prompts (optional)
      let imagePrompt: string;
      let videoPrompt: string;
      let caption: string;

      if (use_openai_expansion) {
        try {
          const expandResult = await expandVideoPrompt(basePrompt);
          if (expandResult) {
            imagePrompt = expandResult.image_prompt;
            videoPrompt = expandResult.video_prompt;
            caption = expandResult.caption;
            console.log('[Test-Generation] OpenAI expansion successful');
          } else {
            const fallback = createFallbackVideoPrompt(basePrompt);
            imagePrompt = fallback.image_prompt;
            videoPrompt = fallback.video_prompt;
            caption = fallback.caption;
            console.log('[Test-Generation] Using fallback prompts');
          }
        } catch (error) {
          console.error('[Test-Generation] OpenAI expansion error:', error);
          const fallback = createFallbackVideoPrompt(basePrompt);
          imagePrompt = fallback.image_prompt;
          videoPrompt = fallback.video_prompt;
          caption = fallback.caption;
        }
      } else {
        const fallback = createFallbackVideoPrompt(basePrompt);
        imagePrompt = fallback.image_prompt;
        videoPrompt = fallback.video_prompt;
        caption = fallback.caption;
      }

      // Create test generation record (NO scenario_id, NO credit deduction)
      const { data: generation, error: genError } = await supabase
        .from('generations')
        .insert({
          user_id: user.id,
          scenario_id: null, // No scenario for tests
          type: 'video',
          status: 'generating',
          prompts_used: [imagePrompt, videoPrompt],
          caption: caption,
          credits_used: 0, // NO CREDITS DEDUCTED
          ai_model: 'seedance',
          metadata: {
            is_test: true, // Flag for filtering
            test_mode: true,
            duration: 65,
            base_duration: 5,
            base_prompt: basePrompt,
            openai_expansion_used: use_openai_expansion,
          },
        })
        .select()
        .single();

      if (genError || !generation) {
        throw new Error(`Failed to create generation record: ${genError?.message}`);
      }

      console.log(`[Test-Generation] Test generation created: ${generation.id}`);

      // Submit to Comet API with proper callback URL
      const functionsBase = SUPABASE_URL.replace('.supabase.co', '.functions.supabase.co');
      const webhookSecret = Deno.env.get('COMET_WEBHOOK_SECRET') || Deno.env.get('MIDJOURNEY_WEBHOOK_SECRET') || '';
      const callbackUrl = `${functionsBase}/comet-callback?generation_id=${generation.id}&token=${encodeURIComponent(webhookSecret)}`;

      const result = await generateVideo({
        image_prompt: imagePrompt,
        video_prompt: videoPrompt,
        callbackUrl,
        duration: 5,
        resolution: '1080p',
        aspectRatio: '9:16',
      });

      if (!result.success) {
        console.error('[Test-Generation] Video submission failed:', result.error);

        // Mark as failed (but don't refund since no credits were deducted)
        await supabase
          .from('generations')
          .update({
            status: 'failed',
            error_message: result.error || 'Video submission failed',
          })
          .eq('id', generation.id);

        return new Response(
          JSON.stringify({
            success: false,
            error: result.error || 'Video submission failed',
            generation_id: generation.id,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }

      console.log(`[Test-Generation] Video submitted to Comet: ${result.task_id}`);

      // Update generation with task ID
      await supabase
        .from('generations')
        .update({
          metadata: {
            ...generation.metadata,
            comet_task_id: result.task_id,
            submitted_at: new Date().toISOString(),
            estimated_time: result.estimated_time,
          },
        })
        .eq('id', generation.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test video generation started (NO credits deducted)',
          generation_id: generation.id,
          type: 'video',
          task_id: result.task_id,
          image_prompt: imagePrompt,
          video_prompt: videoPrompt,
          caption: caption,
          credits_deducted: 0,
          is_test: true,
          estimated_time: result.estimated_time,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Should never reach here
    throw new Error('Invalid generation type');
  } catch (error) {
    console.error('[Test-Generation] Error:', error);

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
