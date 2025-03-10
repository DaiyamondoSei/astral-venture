
-- Function to get user achievements
CREATE OR REPLACE FUNCTION public.get_user_achievements(user_id_param UUID)
RETURNS SETOF public.user_achievements
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM public.user_achievements 
  WHERE user_id = user_id_param
  ORDER BY created_at DESC;
END;
$$;

-- Grant execute privileges
GRANT EXECUTE ON FUNCTION public.get_user_achievements TO authenticated;
