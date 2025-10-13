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

    const { prompt, type, imageCount } = await req.json();

    console.log('Expanding prompt:', { prompt, type, imageCount });

    if (type === 'image') {
      // Expand prompt for images - create detailed prompts for each image
      const detailedPrompts = [];
      for (let i = 0; i < imageCount; i++) {
        detailedPrompts.push(`${prompt}, variation ${i + 1}, highly detailed, 8k, professional photography`);
      }

      // Generate SEO-optimized caption with hashtags
      const caption = `${prompt} 🔥\n\n#fyp #foryou #viral #trending #explore #ai #aiart #digitalart #creative`;

      return new Response(JSON.stringify({
        expandedPrompts: detailedPrompts,
        caption
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Expand prompt for video
      const sceneDescription = `${prompt}, cinematic, smooth motion, highly detailed`;
      const movementInstructions = 'Camera slowly pans across the scene, subtle depth of field, smooth transitions';
      const caption = `${prompt} 🎬✨\n\n#fyp #foryou #viral #trending #ai #aivideo #animation #creative #satisfying`;

      return new Response(JSON.stringify({
        sceneDescription,
        movementInstructions,
        caption
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in content-director:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
