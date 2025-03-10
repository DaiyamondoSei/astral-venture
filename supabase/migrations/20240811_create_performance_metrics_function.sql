
-- Function to ensure the performance_metrics table exists
CREATE OR REPLACE FUNCTION public.ensure_performance_metrics_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if table exists, create it if not
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'performance_metrics'
  ) THEN
    -- Create the performance_metrics table
    CREATE TABLE public.performance_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      component_name TEXT NOT NULL,
      average_render_time FLOAT NOT NULL,
      total_renders INTEGER NOT NULL,
      slow_renders INTEGER NOT NULL,
      first_render_time FLOAT,
      interaction_latency FLOAT,
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      client_timestamp TIMESTAMPTZ,
      server_timestamp TIMESTAMPTZ DEFAULT now(),
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Enable RLS on the table
    ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

    -- Create a policy for admin access
    CREATE POLICY "Admins can view all performance metrics"
      ON public.performance_metrics FOR SELECT
      TO authenticated
      USING (auth.jwt() ? 'is_admin');

    -- Create the web_vitals table
    CREATE TABLE IF NOT EXISTS public.web_vitals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      value FLOAT NOT NULL,
      category TEXT NOT NULL,
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      client_timestamp TIMESTAMPTZ,
      server_timestamp TIMESTAMPTZ DEFAULT now(),
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Enable RLS on the web_vitals table
    ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;

    -- Create a policy for admin access
    CREATE POLICY "Admins can view all web vitals"
      ON public.web_vitals FOR SELECT
      TO authenticated
      USING (auth.jwt() ? 'is_admin');

    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.ensure_performance_metrics_table() TO service_role;
