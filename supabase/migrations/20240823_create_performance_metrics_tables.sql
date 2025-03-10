
-- Create performance metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  component_name TEXT NOT NULL,
  average_render_time DOUBLE PRECISION NOT NULL,
  total_renders INTEGER NOT NULL,
  slow_renders INTEGER NOT NULL,
  first_render_time DOUBLE PRECISION,
  client_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create web vitals metrics table
CREATE TABLE IF NOT EXISTS public.web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL,
  client_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RPC function to ensure performance metrics tables exist
CREATE OR REPLACE FUNCTION public.ensure_performance_metrics_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create performance metrics table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    component_name TEXT NOT NULL,
    average_render_time DOUBLE PRECISION NOT NULL,
    total_renders INTEGER NOT NULL,
    slow_renders INTEGER NOT NULL,
    first_render_time DOUBLE PRECISION,
    client_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  );

  -- Create web vitals metrics table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.web_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    category TEXT NOT NULL,
    client_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  );

  RETURN TRUE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.ensure_performance_metrics_table TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_performance_metrics_table TO service_role;

-- Add row level security policies
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own metrics
CREATE POLICY "Users can view their own performance metrics"
  ON public.performance_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own web vitals"
  ON public.web_vitals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role and authenticated users to insert metrics
CREATE POLICY "Service role can insert performance metrics"
  ON public.performance_metrics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can insert web vitals"
  ON public.web_vitals
  FOR INSERT
  WITH CHECK (true);

-- Add function to get performance metrics for a user with pagination
CREATE OR REPLACE FUNCTION public.get_performance_metrics(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 100,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  component_name TEXT,
  average_render_time DOUBLE PRECISION,
  total_renders INTEGER,
  slow_renders INTEGER,
  first_render_time DOUBLE PRECISION,
  client_timestamp TIMESTAMP WITH TIME ZONE,
  recorded_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    pm.id,
    pm.component_name,
    pm.average_render_time,
    pm.total_renders,
    pm.slow_renders,
    pm.first_render_time,
    pm.client_timestamp,
    pm.recorded_at
  FROM 
    public.performance_metrics pm
  WHERE 
    pm.user_id = user_id_param
  ORDER BY 
    pm.recorded_at DESC
  LIMIT 
    limit_param
  OFFSET 
    offset_param;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_performance_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_performance_metrics TO service_role;
