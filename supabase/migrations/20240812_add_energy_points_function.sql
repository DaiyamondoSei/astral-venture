
-- Function to add energy points to a user profile
CREATE OR REPLACE FUNCTION public.add_energy_points(
  user_id_param UUID,
  points_to_add INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points INTEGER;
  new_points INTEGER;
  current_level INTEGER;
  new_level INTEGER;
BEGIN
  -- Get current energy points
  SELECT energy_points, astral_level INTO current_points, current_level
  FROM public.user_profiles
  WHERE id = user_id_param;
  
  -- Calculate new points
  current_points := COALESCE(current_points, 0);
  new_points := current_points + points_to_add;
  
  -- Calculate new astral level (logarithmic progression)
  new_level := GREATEST(1, FLOOR(LOG(10, new_points + 1) * 3) + 1);
  
  -- Update user profile with new points and level
  UPDATE public.user_profiles
  SET 
    energy_points = new_points,
    astral_level = new_level,
    last_active_at = NOW()
  WHERE id = user_id_param;
  
  -- Return the new points value
  RETURN new_points;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.add_energy_points TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_energy_points TO service_role;
