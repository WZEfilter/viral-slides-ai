-- Add scheduling fields to scenarios table
ALTER TABLE public.scenarios 
ADD COLUMN scheduled_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_scheduled BOOLEAN DEFAULT false,
ADD COLUMN last_run_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN schedule_frequency TEXT, -- 'once', 'daily', 'weekly', 'monthly'
ADD COLUMN is_paused BOOLEAN DEFAULT false,
ADD COLUMN next_run_at TIMESTAMP WITH TIME ZONE;

-- Add index for scheduled scenarios
CREATE INDEX idx_scenarios_scheduled ON public.scenarios(is_scheduled, is_paused, next_run_at) WHERE is_scheduled = true;