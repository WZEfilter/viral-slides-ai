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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { 
      content_id, 
      status, 
      image_urls, 
      video_url, 
      error_message 
    } = await req.json();

    console.log('Generation callback received:', { content_id, status, image_urls, video_url, error_message });

    if (!content_id) {
      return new Response(JSON.stringify({ error: 'Content ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process and store URLs with viralslides.ai prefix
    const processedUrls: string[] = [];
    if (image_urls && Array.isArray(image_urls)) {
      for (const url of image_urls) {
        // Generate a unique identifier for this asset
        const assetId = crypto.randomUUID();
        const viralSlidesUrl = `https://viralslides.ai/asset/${assetId}`;
        
        // Store the mapping in database
        await supabaseClient
          .from('asset_mappings')
          .insert({
            asset_id: assetId,
            original_url: url,
            content_id: content_id,
            asset_type: 'image'
          });
        
        processedUrls.push(viralSlidesUrl);
      }
    }

    let processedVideoUrl = null;
    if (video_url) {
      const videoAssetId = crypto.randomUUID();
      processedVideoUrl = `https://viralslides.ai/asset/${videoAssetId}`;
      
      await supabaseClient
        .from('asset_mappings')
        .insert({
          asset_id: videoAssetId,
          original_url: video_url,
          content_id: content_id,
          asset_type: 'video'
        });
    }

    // Update the generated content record
    const updateData: any = { status };
    
    if (status === 'completed') {
      updateData.content_urls = processedUrls;
      if (processedVideoUrl) {
        updateData.thumbnail_url = processedVideoUrl;
      }
    }
    
    if (error_message) {
      updateData.metadata = { error_message };
    }

    const { error: updateError } = await supabaseClient
      .from('generated_content')
      .update(updateData)
      .eq('id', content_id);

    if (updateError) {
      console.error('Failed to update content:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update content' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      processed_urls: processedUrls,
      processed_video_url: processedVideoUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in handle-generation-callback function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});