
-- Create a function to safely get performance metrics even if the table doesn't exist yet
CREATE OR REPLACE FUNCTION public.get_performance_metrics(limit_count integer DEFAULT 5)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'performance_metrics'
  ) THEN
    RETURN QUERY 
    SELECT row_to_json(pm) 
    FROM (
      SELECT * FROM public.performance_metrics 
      ORDER BY created_at DESC 
      LIMIT limit_count
    ) pm;
  ELSE
    RETURN QUERY SELECT '[]'::json;
  END IF;
END;
$$;

-- Grant execute privileges
GRANT EXECUTE ON FUNCTION public.get_performance_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_performance_metrics TO service_role;
