// Edge Function: generate-images
// Purpose: Generate image slideshow using OpenAI + Kie.ai MidJourney

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { deductCredits, calculateCreditCost } from '../_shared/credits.ts';
import { expandImagePrompts, createFallbackImagePrompts } from '../_shared/openai.ts';
import { generateImage } from '../_shared/kieai.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = Deno.env.get('APP_URL') || 'https://viralslides.ai';

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

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { scenario_id, manual_trigger = false } = await req.json();

    if (!scenario_id) {
      throw new Error('Missing scenario_id');
    }

    // Fetch scenario
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenario_id)
      .eq('user_id', user.id)
      .single();

    if (scenarioError || !scenario) {
      throw new Error('Scenario not found');
    }

    // Validate scenario type
    if (scenario.type !== 'image') {
      throw new Error('Scenario must be type "image"');
    }

    const imageCount = scenario.image_count || 6;
    const aiModel = scenario.ai_model || 'mj_v7';

    // Calculate credit cost (1 per image)
    const creditCost = calculateCreditCost('image', imageCount);

    // Deduct credits
    const deductResult = await deductCredits(
      supabase,
      user.id,
      creditCost,
      `Image generation: ${scenario.title}`,
      undefined // generation_id will be added to transaction later
    );

    if (!deductResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: deductResult.error || 'Insufficient credits',
          credits_required: creditCost,
          credits_available: deductResult.remainingCredits || 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log(`Credits deducted: ${creditCost}, remaining: ${deductResult.remainingCredits}`);

    // Expand prompts via OpenAI
    let prompts: string[];
    let caption: string;

    try {
      const expandResult = await expandImagePrompts(scenario.base_prompt, imageCount);

      if (expandResult) {
        prompts = expandResult.prompts;
        caption = expandResult.caption;
        console.log('OpenAI expansion successful');
      } else {
        // Fallback to base prompt
        const fallback = createFallbackImagePrompts(scenario.base_prompt, imageCount);
        prompts = fallback.prompts;
        caption = fallback.caption;
        console.log('Using fallback prompts (OpenAI failed)');
      }
    } catch (error) {
      // Fallback on any error
      console.error('OpenAI expansion error:', error);
      const fallback = createFallbackImagePrompts(scenario.base_prompt, imageCount);
      prompts = fallback.prompts;
      caption = fallback.caption;
    }

    // Create generation record
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        scenario_id: scenario_id,
        type: 'image',
        status: 'processing',
        prompts_used: prompts,
        caption: caption,
        credits_used: creditCost,
        ai_model: aiModel,
        metadata: {
          image_count: imageCount,
          manual_trigger,
        },
      })
      .select()
      .single();

    if (genError || !generation) {
      // Refund credits if generation record creation fails
      await supabase.rpc('refund_credits', {
        p_user_id: user.id,
        p_amount: creditCost,
        p_reason: 'Generation record creation failed',
      });

      throw new Error(`Failed to create generation record: ${genError?.message}`);
    }

    console.log(`Generation created: ${generation.id}`);

    // Submit images to Kie.ai
    const callbackUrl = `${SUPABASE_URL}/functions/v1/mj-callback`;
    const imageRequests: Array<{
      index: number;
      prompt: string;
      request_id?: string;
      error?: string;
    }> = [];

    for (let i = 0; i < prompts.length; i++) {
      const result = await generateImage({
        prompt: prompts[i],
        callbackUrl: `${callbackUrl}?generation_id=${generation.id}&image_index=${i}`,
        aspectRatio: '9:16',
        model: aiModel,
      });

      if (result.success && result.request_id) {
        imageRequests.push({
          index: i,
          prompt: prompts[i],
          request_id: result.request_id,
        });
        console.log(`Image ${i + 1}/${prompts.length} submitted: ${result.request_id}`);
      } else {
        imageRequests.push({
          index: i,
          prompt: prompts[i],
          error: result.error,
        });
        console.error(`Image ${i + 1}/${prompts.length} failed:`, result.error);
      }
    }

    // Update generation with request IDs
    await supabase
      .from('generations')
      .update({
        metadata: {
          ...generation.metadata,
          image_requests: imageRequests,
          submitted_at: new Date().toISOString(),
        },
      })
      .eq('id', generation.id);

    // Check if all failed
    const allFailed = imageRequests.every((req) => req.error);

    if (allFailed) {
      // All images failed - refund credits and mark as failed
      await supabase.rpc('refund_credits', {
        p_user_id: user.id,
        p_amount: creditCost,
        p_reason: 'All image generations failed',
        p_generation_id: generation.id,
      });

      await supabase
        .from('generations')
        .update({ status: 'failed', error_message: 'All image submissions failed' })
        .eq('id', generation.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'All image submissions failed',
          generation_id: generation.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        generation_id: generation.id,
        images_submitted: imageRequests.filter((r) => r.request_id).length,
        total_images: imageCount,
        credits_used: creditCost,
        credits_remaining: deductResult.remainingCredits,
        status: 'processing',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Generate images error:', error);

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
