-- Create asset_mappings table to store URL mappings
CREATE TABLE public.asset_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  content_id UUID NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'video')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.asset_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies for asset mappings (public read for serving assets)
CREATE POLICY "Assets are publicly readable" 
ON public.asset_mappings 
FOR SELECT 
USING (true);

CREATE POLICY "Only system can manage asset mappings" 
ON public.asset_mappings 
FOR INSERT 
WITH CHECK (false);

-- Create index for fast asset lookup
CREATE INDEX idx_asset_mappings_asset_id ON public.asset_mappings(asset_id);
CREATE INDEX idx_asset_mappings_content_id ON public.asset_mappings(content_id);