// Edge Function: generate-video
// Purpose: Generate looping video using OpenAI + Comet Seedance

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { deductCredits, calculateCreditCost } from '../_shared/credits.ts';
import { expandVideoPrompt, createFallbackVideoPrompt } from '../_shared/openai.ts';
import { generateVideo } from '../_shared/comet.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = Deno.env.get('APP_URL') || 'https://viralslides.ai';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': APP_URL,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    if (scenario.type !== 'video') {
      throw new Error('Scenario must be type "video"');
    }

    const aiModel = scenario.ai_model || 'seedance';

    // Calculate credit cost (12 fixed for video)
    const creditCost = calculateCreditCost('video');

    // Deduct credits
    const deductResult = await deductCredits(
      supabase,
      user.id,
      creditCost,
      `Video generation: ${scenario.title}`,
      undefined
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
    let imagePrompt: string;
    let videoPrompt: string;
    let caption: string;

    try {
      const expandResult = await expandVideoPrompt(scenario.base_prompt);

      if (expandResult) {
        imagePrompt = expandResult.image_prompt;
        videoPrompt = expandResult.video_prompt;
        caption = expandResult.caption;
        console.log('OpenAI video expansion successful');
      } else {
        const fallback = createFallbackVideoPrompt(scenario.base_prompt);
        imagePrompt = fallback.image_prompt;
        videoPrompt = fallback.video_prompt;
        caption = fallback.caption;
        console.log('Using fallback prompts (OpenAI failed)');
      }
    } catch (error) {
      console.error('OpenAI expansion error:', error);
      const fallback = createFallbackVideoPrompt(scenario.base_prompt);
      imagePrompt = fallback.image_prompt;
      videoPrompt = fallback.video_prompt;
      caption = fallback.caption;
    }

    // Create generation record
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        scenario_id: scenario_id,
        type: 'video',
        status: 'processing',
        prompts_used: [imagePrompt, videoPrompt],
        caption: caption,
        credits_used: creditCost,
        ai_model: aiModel,
        metadata: {
          manual_trigger,
          duration: 65, // Final stitched duration
          base_duration: 5, // Comet generates 5-second base
        },
      })
      .select()
      .single();

    if (genError || !generation) {
      // Refund credits
      await supabase.rpc('refund_credits', {
        p_user_id: user.id,
        p_amount: creditCost,
        p_reason: 'Generation record creation failed',
      });

      throw new Error(`Failed to create generation record: ${genError?.message}`);
    }

    console.log(`Generation created: ${generation.id}`);

    // Submit to Comet API
    const callbackUrl = `${SUPABASE_URL}/functions/v1/comet-callback?generation_id=${generation.id}`;

    const result = await generateVideo({
      image_prompt: imagePrompt,
      video_prompt: videoPrompt,
      callbackUrl,
      duration: 5, // 5-second base video
      resolution: '1080p',
      aspectRatio: '9:16',
    });

    if (!result.success) {
      console.error('Comet submission failed:', result.error);

      // Refund credits
      await supabase.rpc('refund_credits', {
        p_user_id: user.id,
        p_amount: creditCost,
        p_reason: 'Video submission failed',
        p_generation_id: generation.id,
      });

      // Mark as failed
      await supabase
        .from('generations')
        .update({
          status: 'failed',
          error_message: result.error || 'Comet API submission failed',
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

    console.log(`Video submitted to Comet: ${result.task_id}`);

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

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        generation_id: generation.id,
        task_id: result.task_id,
        credits_used: creditCost,
        credits_remaining: deductResult.remainingCredits,
        status: 'processing',
        estimated_time: result.estimated_time,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Generate video error:', error);

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
