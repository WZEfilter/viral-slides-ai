import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      prompt, 
      imageCount, 
      resolution, 
      isDraft, 
      model, 
      tags,
      title 
    } = await req.json();

    console.log('Generation request:', { prompt, imageCount, resolution, isDraft, model, tags, title });

    // Calculate credits based on model
    const modelCredits: { [key: string]: number } = {
      'flux-kontext-max': 2,
      'flux-kontext-pro': 1,
      'flux-pro': 1,
      'flux-ultra': 1.5
    };

    const creditsPerImage = modelCredits[model] || 1;
    const totalCredits = creditsPerImage * imageCount;

    // Check user credits
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('credits_used, credits_limit')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const availableCredits = profile.credits_limit - profile.credits_used;
    if (availableCredits < totalCredits) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create content record
    const { data: content, error: contentError } = await supabaseClient
      .from('generated_content')
      .insert({
        user_id: user.id,
        content_type: 'slideshow_images',
        title: title || 'Untitled Generation',
        prompt,
        credits_used: totalCredits,
        status: 'generating',
        metadata: {
          imageCount,
          resolution,
          isDraft,
          model,
          tags
        }
      })
      .select()
      .single();

    if (contentError) {
      console.error('Content creation error:', contentError);
      return new Response(JSON.stringify({ error: 'Failed to create content record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Deduct credits
    const { error: creditError } = await supabaseClient
      .from('profiles')
      .update({ credits_used: profile.credits_used + totalCredits })
      .eq('user_id', user.id);

    if (creditError) {
      console.error('Credit deduction error:', creditError);
    }

    // Record credit transaction
    const { error: transactionError } = await supabaseClient
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: -totalCredits,
        transaction_type: 'usage',
        description: `Image generation: ${imageCount} images using ${model}`,
        metadata: {
          content_id: content.id,
          model,
          imageCount
        }
      });

    if (transactionError) {
      console.error('Transaction record error:', transactionError);
    }

    // Call Make.com webhook
    const makeWebhookUrl = Deno.env.get('MAKE_WEBHOOK_URL');
    if (!makeWebhookUrl) {
      return new Response(JSON.stringify({ error: 'Webhook URL not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webhookPayload = {
      content_id: content.id,
      user_id: user.id,
      prompt,
      image_count: imageCount,
      resolution,
      is_draft: isDraft,
      model,
      tags,
      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-generation-callback`
    };

    console.log('Sending to Make.com:', webhookPayload);

    const webhookResponse = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      console.error('Webhook failed:', await webhookResponse.text());
      
      // Update content status to failed
      await supabaseClient
        .from('generated_content')
        .update({ status: 'failed' })
        .eq('id', content.id);

      return new Response(JSON.stringify({ error: 'Generation request failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      content_id: content.id,
      message: 'Generation started'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});