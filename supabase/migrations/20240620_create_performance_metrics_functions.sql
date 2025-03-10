
-- Create performance metrics functions

-- Function to ensure performance metrics table exists
CREATE OR REPLACE FUNCTION public.ensure_performance_metrics_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the performance_metrics table exists, create it if not
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'performance_metrics'
  ) THEN
    -- Create the performance_metrics table
    CREATE TABLE public.performance_metrics (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      component_name TEXT NOT NULL,
      average_render_time FLOAT NOT NULL,
      total_renders INTEGER NOT NULL,
      slow_renders INTEGER NOT NULL,
      max_render_time FLOAT NOT NULL,
      min_render_time FLOAT NOT NULL,
      user_id UUID REFERENCES auth.users(id),
      metric_type TEXT NOT NULL DEFAULT 'render',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      context JSONB
    );

    -- Add RLS policies
    ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

    -- Allow users to view their own metrics
    CREATE POLICY "Users can view their own performance metrics"
      ON public.performance_metrics
      FOR SELECT
      USING (auth.uid() = user_id OR user_id IS NULL);

    -- Allow users to insert their own metrics
    CREATE POLICY "Users can insert their own performance metrics"
      ON public.performance_metrics
      FOR INSERT
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
      
    -- Add performance metrics to anon selection permissions
    GRANT SELECT ON public.performance_metrics TO anon;
    GRANT INSERT ON public.performance_metrics TO anon;
    
    -- Create web_vitals table
    CREATE TABLE public.web_vitals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      value FLOAT NOT NULL,
      category TEXT NOT NULL,
      user_id UUID REFERENCES auth.users(id),
      client_timestamp TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Add RLS policies for web_vitals
    ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;
    
    -- Allow users to view their own web vitals
    CREATE POLICY "Users can view their own web vitals"
      ON public.web_vitals
      FOR SELECT
      USING (auth.uid() = user_id OR user_id IS NULL);
      
    -- Allow users to insert their own web vitals
    CREATE POLICY "Users can insert their own web vitals"
      ON public.web_vitals
      FOR INSERT
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
      
    -- Grant permissions
    GRANT SELECT ON public.web_vitals TO anon;
    GRANT INSERT ON public.web_vitals TO anon;
    
    RETURN TRUE;
  ELSE
    RETURN TRUE;
  END IF;
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
  -- Ensure the performance_metrics table exists
  PERFORM ensure_performance_metrics_table();
  
  -- Return metrics for the specified user
  RETURN QUERY 
  SELECT * FROM public.performance_metrics 
  WHERE user_id = user_id_param OR user_id IS NULL
  ORDER BY created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Function to get web vitals metrics for a user
CREATE OR REPLACE FUNCTION public.get_web_vitals(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 100,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  value FLOAT,
  category TEXT,
  user_id UUID,
  client_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure the web_vitals table exists
  PERFORM ensure_performance_metrics_table();
  
  -- Return web vitals for the specified user
  RETURN QUERY 
  SELECT 
    wv.id,
    wv.name,
    wv.value,
    wv.category,
    wv.user_id,
    wv.client_timestamp,
    wv.created_at
  FROM 
    public.web_vitals wv
  WHERE 
    wv.user_id = user_id_param OR wv.user_id IS NULL
  ORDER BY 
    wv.created_at DESC
  LIMIT 
    limit_param
  OFFSET 
    offset_param;
END;
$$;

-- Function to get performance summary
CREATE OR REPLACE FUNCTION public.get_performance_summary(
  user_id_param UUID,
  days_param INTEGER DEFAULT 7
)
RETURNS TABLE (
  component_name TEXT,
  avg_render_time FLOAT,
  total_renders BIGINT,
  slow_renders BIGINT,
  first_seen TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure the performance_metrics table exists
  PERFORM ensure_performance_metrics_table();
  
  -- Calculate the cutoff date
  DECLARE cutoff_date TIMESTAMP WITH TIME ZONE := now() - (days_param * INTERVAL '1 day');
  
  -- Return summarized metrics
  RETURN QUERY 
  SELECT 
    pm.component_name,
    AVG(pm.average_render_time) AS avg_render_time,
    SUM(pm.total_renders) AS total_renders,
    SUM(pm.slow_renders) AS slow_renders,
    MIN(pm.created_at) AS first_seen,
    MAX(pm.created_at) AS last_seen
  FROM 
    public.performance_metrics pm
  WHERE 
    (pm.user_id = user_id_param OR pm.user_id IS NULL)
    AND pm.created_at >= cutoff_date
  GROUP BY 
    pm.component_name
  ORDER BY 
    avg_render_time DESC;
END;
$$;

-- Grant execute privileges
GRANT EXECUTE ON FUNCTION public.ensure_performance_metrics_table TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_performance_metrics_table TO anon;
GRANT EXECUTE ON FUNCTION public.get_performance_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_performance_metrics TO anon;
GRANT EXECUTE ON FUNCTION public.get_web_vitals TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_web_vitals TO anon;
GRANT EXECUTE ON FUNCTION public.get_performance_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_performance_summary TO anon;
