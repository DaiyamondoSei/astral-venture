
-- Create tables for performance monitoring

-- 1. Performance Sessions Table
CREATE TABLE IF NOT EXISTS public.performance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  device_info JSONB,
  app_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT user_session_unique UNIQUE (user_id, session_id)
);

-- Create index on user_id for quick lookups
CREATE INDEX IF NOT EXISTS performance_sessions_user_id_idx ON public.performance_sessions(user_id);

-- 2. Component Performance Metrics
CREATE TABLE IF NOT EXISTS public.performance_component_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name TEXT NOT NULL,
  render_time FLOAT NOT NULL,
  render_type TEXT NOT NULL DEFAULT 'update',
  user_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_id TEXT
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS perf_component_metrics_component_name_idx ON public.performance_component_metrics(component_name);
CREATE INDEX IF NOT EXISTS perf_component_metrics_user_id_idx ON public.performance_component_metrics(user_id);
CREATE INDEX IF NOT EXISTS perf_component_metrics_timestamp_idx ON public.performance_component_metrics(timestamp);

-- 3. Web Vitals Metrics
CREATE TABLE IF NOT EXISTS public.performance_web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value FLOAT NOT NULL,
  category TEXT NOT NULL,
  user_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_id TEXT
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS perf_web_vitals_metric_name_idx ON public.performance_web_vitals(metric_name);
CREATE INDEX IF NOT EXISTS perf_web_vitals_user_id_idx ON public.performance_web_vitals(user_id);
CREATE INDEX IF NOT EXISTS perf_web_vitals_timestamp_idx ON public.performance_web_vitals(timestamp);

-- Cleanup function to remove old metrics (optional)
CREATE OR REPLACE FUNCTION clean_old_performance_metrics()
RETURNS void AS $$
BEGIN
  -- Delete metrics older than 30 days
  DELETE FROM public.performance_component_metrics 
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  DELETE FROM public.performance_web_vitals
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Keep sessions but clean out orphaned ones
  DELETE FROM public.performance_sessions
  WHERE created_at < NOW() - INTERVAL '60 days';
END;
$$ LANGUAGE plpgsql;

-- Permissions
ALTER TABLE public.performance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_component_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_web_vitals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for performance_sessions
CREATE POLICY "Users can view their own session data"
  ON public.performance_sessions
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- RLS Policies for performance_component_metrics
CREATE POLICY "Users can view their own component metrics"
  ON public.performance_component_metrics
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- RLS Policies for performance_web_vitals
CREATE POLICY "Users can view their own web vitals"
  ON public.performance_web_vitals
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Admin functions for performance analysis
CREATE OR REPLACE FUNCTION get_performance_metrics(
  p_user_id TEXT DEFAULT NULL,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  component_name TEXT,
  avg_render_time FLOAT,
  total_count BIGINT,
  slow_renders BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pcm.component_name,
    AVG(pcm.render_time) as avg_render_time,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE pcm.render_time > 100) as slow_renders
  FROM 
    public.performance_component_metrics pcm
  WHERE
    (p_user_id IS NULL OR pcm.user_id = p_user_id) AND
    pcm.timestamp > NOW() - (p_days || ' days')::INTERVAL
  GROUP BY
    pcm.component_name
  ORDER BY
    avg_render_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
