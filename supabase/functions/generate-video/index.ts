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

    const { sceneDescription, movementInstructions } = await req.json();
    const COMET_API_KEY = Deno.env.get('COMET_API_KEY');

    if (!COMET_API_KEY) {
      throw new Error('COMET_API_KEY not configured');
    }

    console.log('Generating video with Comet API');

    let videoUrl = null;
    let attempt = 0;

    while (attempt < 2 && !videoUrl) {
      try {
        attempt++;
        console.log(`Attempt ${attempt} to generate video`);

        // Call Comet API (Seedance 1.0) - placeholder URL
        const response = await fetch('https://api.comet.ai/v1/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${COMET_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'seedance-1.0',
            sceneDescription,
            movementInstructions,
            duration: 5, // 5 seconds base clip
          }),
        });

        if (!response.ok) {
          throw new Error(`Comet API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.videoUrl) {
          videoUrl = data.videoUrl;
          console.log('Video generated successfully');
        } else {
          throw new Error('No video URL returned');
        }
      } catch (error) {
        console.error(`Video generation attempt ${attempt} failed:`, error);
        if (attempt === 2) {
          throw error;
        }
      }
    }

    if (!videoUrl) {
      throw new Error('Failed to generate video after retries');
    }

    // Note: The looping of the 5-second clip 13 times to create a 65-second video
    // would typically be done by the Comet API or a separate video processing service
    // For now, we return the base clip URL
    return new Response(JSON.stringify({
      videoUrl,
      message: 'Video generated successfully. Loop processing will be handled separately.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-video:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
