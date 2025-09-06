import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const assetId = url.pathname.split('/').pop();

    if (!assetId) {
      return new Response('Asset ID required', { status: 400 });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the original URL from the mapping
    const { data: mapping, error } = await supabaseClient
      .from('asset_mappings')
      .select('original_url, asset_type')
      .eq('asset_id', assetId)
      .single();

    if (error || !mapping) {
      return new Response('Asset not found', { status: 404 });
    }

    // Fetch the original asset
    const assetResponse = await fetch(mapping.original_url);
    
    if (!assetResponse.ok) {
      return new Response('Asset unavailable', { status: 404 });
    }

    // Return the asset with appropriate headers
    const contentType = mapping.asset_type === 'image' ? 'image/jpeg' : 'video/mp4';
    
    return new Response(assetResponse.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error serving asset:', error);
    return new Response('Internal server error', { status: 500 });
  }
});