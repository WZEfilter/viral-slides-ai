import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { prompts, model } = await req.json();
    const MIDJOURNEY_API_KEY = Deno.env.get('MIDJOURNEY_API_KEY');

    if (!MIDJOURNEY_API_KEY) {
      throw new Error('MIDJOURNEY_API_KEY not configured');
    }

    console.log('Generating images:', { count: prompts.length, model });

    const results = [];
    const failedIndexes = [];

    // Generate images for each prompt
    for (let i = 0; i < prompts.length; i++) {
      try {
        // Call MidJourney API (this is a placeholder - replace with actual API)
        const response = await fetch('https://api.midjourney.com/v1/imagine', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MIDJOURNEY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompts[i],
            model: model,
          }),
        });

        if (!response.ok) {
          throw new Error(`MidJourney API error: ${response.status}`);
        }

        const data = await response.json();
        
        // MidJourney returns 4 images per call - we take the first one
        if (data.images && data.images.length > 0) {
          results.push(data.images[0].url);
        } else {
          throw new Error('No images returned');
        }
      } catch (error) {
        console.error(`Failed to generate image ${i}:`, error);
        failedIndexes.push(i);
        results.push(null);
      }
    }

    // Retry failed images once
    if (failedIndexes.length > 0) {
      console.log('Retrying failed images:', failedIndexes);
      
      for (const index of failedIndexes) {
        try {
          const response = await fetch('https://api.midjourney.com/v1/imagine', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${MIDJOURNEY_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: prompts[index],
              model: model,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.images && data.images.length > 0) {
              results[index] = data.images[0].url;
              const retryIndex = failedIndexes.indexOf(index);
              if (retryIndex > -1) {
                failedIndexes.splice(retryIndex, 1);
              }
            }
          }
        } catch (retryError) {
          console.error(`Retry failed for image ${index}:`, retryError);
        }
      }
    }

    return new Response(JSON.stringify({
      images: results.filter(url => url !== null),
      failedCount: failedIndexes.length,
      successCount: results.filter(url => url !== null).length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-images:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
