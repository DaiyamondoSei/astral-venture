
-- Table for storing component performance metrics
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  component_name TEXT NOT NULL,
  average_render_time FLOAT NOT NULL,
  total_renders INTEGER NOT NULL,
  slow_renders INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metric_type TEXT NOT NULL,
  device_info JSONB,
  metric_data JSONB
);

-- Index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS performance_metrics_user_id_idx ON public.performance_metrics(user_id);

-- Index on component_name for grouping
CREATE INDEX IF NOT EXISTS performance_metrics_component_name_idx ON public.performance_metrics(component_name);

-- Web Vitals metrics table
CREATE TABLE IF NOT EXISTS public.web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  value FLOAT NOT NULL,
  category TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  device_info JSONB
);

-- Index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS web_vitals_user_id_idx ON public.web_vitals(user_id);

-- Enable RLS on both tables
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for performance_metrics
CREATE POLICY "Users can read only their own performance metrics"
  ON public.performance_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance metrics"
  ON public.performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for web_vitals
CREATE POLICY "Users can read only their own web vitals"
  ON public.web_vitals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own web vitals"
  ON public.web_vitals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to ensure performance metrics tables exist
CREATE OR REPLACE FUNCTION public.ensure_performance_metrics_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if tables exist
  PERFORM 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'performance_metrics';
  
  PERFORM 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'web_vitals';
  
  RETURN true;
END;
$$;

-- Function to get performance metrics for a user
CREATE OR REPLACE FUNCTION public.get_performance_metrics(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 100,
  offset_param INTEGER DEFAULT 0
)
RETURNS SETOF public.performance_metrics
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.performance_metrics
  WHERE user_id = user_id_param
  ORDER BY created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Function to get web vitals for a user
CREATE OR REPLACE FUNCTION public.get_web_vitals(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 100,
  offset_param INTEGER DEFAULT 0
)
RETURNS SETOF public.web_vitals
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.web_vitals
  WHERE user_id = user_id_param
  ORDER BY timestamp DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Function to get a summary of performance metrics
CREATE OR REPLACE FUNCTION public.get_performance_summary(
  user_id_param UUID,
  days_param INTEGER DEFAULT 7
)
RETURNS TABLE(
  date DATE,
  average_render_time FLOAT,
  total_renders INTEGER,
  slow_renders INTEGER,
  component_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    AVG(average_render_time) as average_render_time,
    SUM(total_renders) as total_renders,
    SUM(slow_renders) as slow_renders,
    COUNT(DISTINCT component_name) as component_count
  FROM public.performance_metrics
  WHERE 
    user_id = user_id_param AND
    created_at >= (CURRENT_DATE - days_param::integer)
  GROUP BY DATE(created_at)
  ORDER BY DATE(created_at) DESC;
END;
$$;

-- Grant execution privileges on functions
GRANT EXECUTE ON FUNCTION public.ensure_performance_metrics_table TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_performance_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_web_vitals TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_performance_summary TO authenticated;
