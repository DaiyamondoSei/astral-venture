
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

-- Grant execute privileges
GRANT EXECUTE ON FUNCTION public.ensure_performance_metrics_table TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_performance_metrics_table TO anon;
GRANT EXECUTE ON FUNCTION public.get_performance_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_performance_metrics TO anon;
