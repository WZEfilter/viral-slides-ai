-- Create scenarios table for user projects
CREATE TABLE public.scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  niche TEXT NOT NULL,
  target_audience TEXT,
  content_style TEXT,
  platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Create policies for scenarios
CREATE POLICY "Users can view their own scenarios" 
ON public.scenarios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scenarios" 
ON public.scenarios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenarios" 
ON public.scenarios 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenarios" 
ON public.scenarios 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scenarios_updated_at
BEFORE UPDATE ON public.scenarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create credit_transactions table for tracking credit usage
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
  description TEXT,
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for credit transactions
CREATE POLICY "Users can view their own transactions" 
ON public.credit_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.credit_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create platform_connections table
CREATE TABLE public.platform_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_type TEXT NOT NULL CHECK (platform_type IN ('tiktok', 'instagram', 'pinterest')),
  account_username TEXT NOT NULL,
  account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform_type, account_id)
);

-- Enable RLS
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for platform connections
CREATE POLICY "Users can view their own connections" 
ON public.platform_connections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own connections" 
ON public.platform_connections 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_platform_connections_updated_at
BEFORE UPDATE ON public.platform_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create generated_content table for storing slideshow results
CREATE TABLE public.generated_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('slideshow_images', 'slideshow_video')),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed', 'published')),
  prompt TEXT,
  credits_used INTEGER DEFAULT 0,
  content_urls TEXT[],
  thumbnail_url TEXT,
  metadata JSONB,
  published_platforms TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- Create policies for generated content
CREATE POLICY "Users can view their own content" 
ON public.generated_content 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content" 
ON public.generated_content 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content" 
ON public.generated_content 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content" 
ON public.generated_content 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_generated_content_updated_at
BEFORE UPDATE ON public.generated_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_scenarios_user_id ON public.scenarios(user_id);
CREATE INDEX idx_scenarios_status ON public.scenarios(status);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON public.credit_transactions(transaction_type);
CREATE INDEX idx_platform_connections_user_id ON public.platform_connections(user_id);
CREATE INDEX idx_platform_connections_platform ON public.platform_connections(platform_type);
CREATE INDEX idx_generated_content_user_id ON public.generated_content(user_id);
CREATE INDEX idx_generated_content_scenario ON public.generated_content(scenario_id);
CREATE INDEX idx_generated_content_status ON public.generated_content(status);