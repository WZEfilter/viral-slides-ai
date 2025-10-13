-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_balance INT NOT NULL DEFAULT 0,
  subscription_plan TEXT CHECK (subscription_plan IN ('creator', 'entrepreneur')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create TikTok connections table
CREATE TABLE public.tiktok_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  daily_post_count INT NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tiktok_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own TikTok connections"
  ON public.tiktok_connections FOR ALL
  USING (auth.uid() = user_id);

-- Create scenarios table
CREATE TABLE public.scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  ai_model TEXT NOT NULL,
  image_count INT,
  custom_thumbnail_url TEXT,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'custom')),
  schedule_time TIME NOT NULL,
  schedule_days TEXT[],
  target_accounts UUID[] NOT NULL,
  privacy TEXT NOT NULL CHECK (privacy IN ('public', 'private')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
  next_run_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own scenarios"
  ON public.scenarios FOR ALL
  USING (auth.uid() = user_id);

-- Create generation history table
CREATE TABLE public.generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  original_prompt TEXT NOT NULL,
  expanded_prompt TEXT,
  caption TEXT,
  thumbnail_url TEXT,
  content_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'posted', 'failed', 'partial')),
  target_accounts JSONB,
  credits_used INT NOT NULL DEFAULT 0,
  credits_refunded INT NOT NULL DEFAULT 0,
  error_message TEXT,
  is_playground BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generation history"
  ON public.generation_history FOR SELECT
  USING (auth.uid() = user_id);

-- Create credit transactions table
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'deduction', 'refund')),
  description TEXT NOT NULL,
  generation_id UUID REFERENCES public.generation_history(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tiktok_connections_updated_at
  BEFORE UPDATE ON public.tiktok_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON public.scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, credits_balance)
  VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to auto-delete expired history
CREATE OR REPLACE FUNCTION public.delete_expired_history()
RETURNS void AS $$
BEGIN
  DELETE FROM public.generation_history
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to reset TikTok daily counters
CREATE OR REPLACE FUNCTION public.reset_tiktok_counters()
RETURNS void AS $$
BEGIN
  UPDATE public.tiktok_connections
  SET daily_post_count = 0,
      last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;