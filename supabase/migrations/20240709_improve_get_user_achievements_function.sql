
-- Improved function to get user achievements with better formatting
CREATE OR REPLACE FUNCTION public.get_user_achievements(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  achievement_id TEXT,
  progress FLOAT,
  awarded BOOLEAN,
  awarded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  achievement_data JSONB,
  category TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    ua.id,
    ua.user_id,
    ua.achievement_id,
    ua.progress,
    ua.awarded,
    ua.awarded_at,
    ua.updated_at,
    ua.created_at,
    to_jsonb(a) AS achievement_data,
    a.category
  FROM 
    public.user_achievements ua
  LEFT JOIN 
    public.achievements a ON ua.achievement_id = a.id
  WHERE 
    ua.user_id = user_id_param
  ORDER BY 
    ua.awarded DESC, -- Show awarded achievements first
    ua.progress DESC, -- Then show achievements with most progress
    ua.updated_at DESC; -- Then most recently updated
END;
$$;

-- Grant execute privileges
GRANT EXECUTE ON FUNCTION public.get_user_achievements TO authenticated;
