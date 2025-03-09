
-- Create a function to safely get user achievements
CREATE OR REPLACE FUNCTION public.get_user_achievements(user_id_param UUID)
RETURNS TABLE (
  achievement_id TEXT,
  progress FLOAT,
  awarded BOOLEAN,
  awarded_at TIMESTAMPTZ,
  achievement_data JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_achievements'
  ) THEN
    RETURN QUERY 
    SELECT 
      ua.achievement_id::TEXT,
      ua.progress,
      ua.awarded,
      ua.awarded_at,
      ua.achievement_data,
      ua.created_at,
      ua.updated_at
    FROM public.user_achievements ua
    WHERE ua.user_id = user_id_param;
  ELSE
    -- Return empty result if table doesn't exist
    RETURN;
  END IF;
END;
$$;

-- Grant execute privileges
GRANT EXECUTE ON FUNCTION public.get_user_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_achievements TO service_role;
