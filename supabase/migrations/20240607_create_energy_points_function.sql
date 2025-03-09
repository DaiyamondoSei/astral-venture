
-- Create function to add energy points to user profiles
CREATE OR REPLACE FUNCTION public.add_energy_points(
  user_id_param UUID,
  points_param INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user's energy points
  UPDATE public.user_profiles
  SET 
    energy_points = energy_points + points_param,
    updated_at = NOW()
  WHERE id = user_id_param;
  
  -- Create a record of the points earned
  INSERT INTO public.user_activities(
    user_id,
    activity_type,
    activity_data,
    energy_points,
    created_at
  )
  VALUES (
    user_id_param,
    'achievement_points',
    jsonb_build_object('source', 'achievement', 'points', points_param),
    points_param,
    NOW()
  );
END;
$$;
