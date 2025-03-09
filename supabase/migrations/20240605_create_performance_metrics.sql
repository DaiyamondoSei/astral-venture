
-- Create performance metrics table for storing aggregated metrics
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  component_name TEXT NOT NULL,
  average_render_time DOUBLE PRECISION,
  total_renders INTEGER,
  slow_renders INTEGER,
  metrics_data JSONB,
  session_id TEXT,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS performance_metrics_user_id_idx ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS performance_metrics_component_name_idx ON public.performance_metrics(component_name);
CREATE INDEX IF NOT EXISTS performance_metrics_created_at_idx ON public.performance_metrics(created_at);

-- Add RLS policies
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own metrics
CREATE POLICY "Users can view their own performance metrics"
  ON public.performance_metrics FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own metrics
CREATE POLICY "Users can insert their own performance metrics"
  ON public.performance_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);
