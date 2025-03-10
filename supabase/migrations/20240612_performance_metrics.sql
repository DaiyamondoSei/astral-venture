
-- Create table for storing performance metrics
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  component_name TEXT NOT NULL,
  average_render_time FLOAT NOT NULL,
  total_renders INTEGER NOT NULL,
  slow_renders INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  additional_data JSONB
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS performance_metrics_user_id_idx ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS performance_metrics_component_name_idx ON public.performance_metrics(component_name);

-- Enable row level security
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policy to only allow users to read their own metrics
CREATE POLICY "Users can read their own performance metrics"
  ON public.performance_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all metrics
CREATE POLICY "Admins can read all performance metrics"
  ON public.performance_metrics
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_performance_metrics_modtime()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_performance_metrics_modtime
BEFORE UPDATE ON public.performance_metrics
FOR EACH ROW
EXECUTE FUNCTION update_performance_metrics_modtime();

-- Function to ensure the table exists
CREATE OR REPLACE FUNCTION ensure_performance_metrics_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'performance_metrics'
  ) THEN
    RETURN true;
  ELSE
    -- Create the table if it doesn't exist (should never happen since we're creating it above)
    CREATE TABLE IF NOT EXISTS public.performance_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id),
      component_name TEXT NOT NULL,
      average_render_time FLOAT NOT NULL,
      total_renders INTEGER NOT NULL,
      slow_renders INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      additional_data JSONB
    );
    
    RETURN true;
  END IF;
END;
$$;

-- Function to get user's performance metrics
CREATE OR REPLACE FUNCTION get_performance_metrics(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 100,
  offset_param INTEGER DEFAULT 0
)
RETURNS SETOF performance_metrics
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.performance_metrics
  WHERE user_id = user_id_param
  ORDER BY updated_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Grant permissions to the functions
GRANT EXECUTE ON FUNCTION ensure_performance_metrics_table TO authenticated;
GRANT EXECUTE ON FUNCTION get_performance_metrics TO authenticated;
