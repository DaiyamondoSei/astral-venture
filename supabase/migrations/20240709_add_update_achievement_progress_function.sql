
-- Function to update achievement progress and award achievements when criteria are met
CREATE OR REPLACE FUNCTION public.update_achievement_progress(
  user_id_param UUID,
  achievement_id_param TEXT,
  progress_value FLOAT,
  auto_award BOOLEAN DEFAULT TRUE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record public.user_achievements;
  achievement_data public.achievements;
  new_progress FLOAT;
  was_newly_awarded BOOLEAN := FALSE;
  award_achievement BOOLEAN;
  result JSONB;
BEGIN
  -- Get the achievement information
  SELECT * INTO achievement_data
  FROM public.achievements
  WHERE id = achievement_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Achievement with ID % not found', achievement_id_param;
  END IF;
  
  -- Check if user already has progress on this achievement
  SELECT * INTO achievement_record
  FROM public.user_achievements
  WHERE user_id = user_id_param AND achievement_id = achievement_id_param;
  
  IF FOUND THEN
    -- Don't update progress if already awarded
    IF achievement_record.awarded THEN
      new_progress := achievement_record.progress;
      award_achievement := FALSE;
    ELSE
      -- Update existing progress - use the higher of the two values
      new_progress := GREATEST(achievement_record.progress, progress_value);
      
      -- Determine if achievement should be awarded
      award_achievement := auto_award AND new_progress >= 100 AND NOT achievement_record.awarded;
      was_newly_awarded := award_achievement;
      
      -- Update the record
      UPDATE public.user_achievements
      SET 
        progress = new_progress,
        awarded = CASE WHEN award_achievement THEN TRUE ELSE awarded END,
        awarded_at = CASE WHEN award_achievement THEN NOW() ELSE awarded_at END,
        updated_at = NOW()
      WHERE id = achievement_record.id
      RETURNING * INTO achievement_record;
    END IF;
  ELSE
    -- Create new progress record
    new_progress := GREATEST(progress_value, 0);
    
    -- Determine if achievement should be awarded immediately
    award_achievement := auto_award AND new_progress >= 100;
    was_newly_awarded := award_achievement;
    
    -- Insert new record
    INSERT INTO public.user_achievements (
      user_id,
      achievement_id,
      progress,
      awarded,
      awarded_at
    )
    VALUES (
      user_id_param,
      achievement_id_param,
      new_progress,
      award_achievement,
      CASE WHEN award_achievement THEN NOW() ELSE NULL END
    )
    RETURNING * INTO achievement_record;
  END IF;
  
  -- Add energy points if newly awarded
  IF was_newly_awarded THEN
    -- Default to 25 points if points not specified
    DECLARE points_to_add INT := COALESCE((achievement_data.requirements->>'points')::INT, 25);
    BEGIN
      -- Add energy points
      PERFORM public.add_energy_points(user_id_param, points_to_add);
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue
      RAISE NOTICE 'Error adding points: %', SQLERRM;
    END;
  END IF;
  
  -- Construct the result
  result := jsonb_build_object(
    'id', achievement_record.id,
    'user_id', achievement_record.user_id,
    'achievement_id', achievement_record.achievement_id,
    'progress', achievement_record.progress,
    'awarded', achievement_record.awarded,
    'awarded_at', achievement_record.awarded_at,
    'newly_awarded', was_newly_awarded,
    'achievement_data', to_jsonb(achievement_data)
  );
  
  RETURN result;
END;
$$;

-- Grant execute privileges
GRANT EXECUTE ON FUNCTION public.update_achievement_progress TO authenticated;
