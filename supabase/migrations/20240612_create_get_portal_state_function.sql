
-- Create a function to safely get user portal state
CREATE OR REPLACE FUNCTION public.get_user_portal_state(user_id_param UUID)
RETURNS TABLE (
  portal_energy FLOAT,
  interaction_count INTEGER,
  resonance_level INTEGER,
  last_interaction_time TIMESTAMPTZ,
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
    AND table_name = 'user_energy_interactions'
  ) THEN
    RETURN QUERY 
    SELECT 
      uei.portal_energy,
      uei.interaction_count,
      uei.resonance_level,
      uei.last_interaction_time,
      uei.created_at,
      uei.updated_at
    FROM public.user_energy_interactions uei
    WHERE uei.user_id = user_id_param;
  ELSE
    -- Return empty result if table doesn't exist
    RETURN;
  END IF;
END;
$$;

-- Grant execute privileges
GRANT EXECUTE ON FUNCTION public.get_user_portal_state TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_portal_state TO service_role;
