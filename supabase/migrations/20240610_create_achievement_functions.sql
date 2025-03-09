
-- Create a table for achievements - stores the available achievements in the system
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('meditation', 'practice', 'reflection', 'wisdom', 'special')),
  requirements JSONB,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure RLS is enabled and only authenticated users can read achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- Create a table to track user achievements progress
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  achievement_id TEXT REFERENCES public.achievements(id) NOT NULL,
  progress FLOAT DEFAULT 0,
  awarded BOOLEAN DEFAULT false,
  awarded_at TIMESTAMPTZ,
  achievement_data JSONB, -- Store a snapshot of the achievement data
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Ensure RLS is enabled
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own achievements
CREATE POLICY "Users can read their own achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_user_achievements_modtime()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the timestamp
CREATE TRIGGER update_user_achievements_modtime
BEFORE UPDATE ON public.user_achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_user_achievements_modtime();

-- Function to safely check if a user has an achievement
CREATE OR REPLACE FUNCTION public.has_achievement(user_id_param UUID, achievement_id_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_it BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE user_id = user_id_param 
    AND achievement_id = achievement_id_param
    AND awarded = true
  ) INTO has_it;
  
  RETURN has_it;
END;
$$;

-- Function to update achievement progress
CREATE OR REPLACE FUNCTION public.update_achievement_progress(
  user_id_param UUID, 
  achievement_id_param TEXT, 
  progress_value FLOAT,
  auto_award BOOLEAN DEFAULT false
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record public.achievements%ROWTYPE;
  user_achievement_record public.user_achievements%ROWTYPE;
  updated BOOLEAN := false;
BEGIN
  -- Get the achievement record
  SELECT * INTO achievement_record FROM public.achievements WHERE id = achievement_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Achievement with ID % not found', achievement_id_param;
  END IF;
  
  -- Check if a user achievement record exists
  SELECT * INTO user_achievement_record 
  FROM public.user_achievements 
  WHERE user_id = user_id_param AND achievement_id = achievement_id_param;
  
  IF FOUND THEN
    -- Update existing record
    IF NOT user_achievement_record.awarded THEN
      UPDATE public.user_achievements
      SET 
        progress = GREATEST(progress_value, user_achievement_record.progress),
        awarded = CASE 
          WHEN auto_award AND progress_value >= 1.0 THEN true
          ELSE user_achievement_record.awarded
        END,
        awarded_at = CASE 
          WHEN auto_award AND progress_value >= 1.0 AND NOT user_achievement_record.awarded THEN now()
          ELSE user_achievement_record.awarded_at
        END
      WHERE user_id = user_id_param AND achievement_id = achievement_id_param;
      
      updated := true;
    END IF;
  ELSE
    -- Create new record
    INSERT INTO public.user_achievements (
      user_id, 
      achievement_id, 
      progress, 
      awarded,
      awarded_at,
      achievement_data
    )
    VALUES (
      user_id_param, 
      achievement_id_param, 
      progress_value,
      CASE WHEN auto_award AND progress_value >= 1.0 THEN true ELSE false END,
      CASE WHEN auto_award AND progress_value >= 1.0 THEN now() ELSE NULL END,
      jsonb_build_object(
        'title', achievement_record.title,
        'description', achievement_record.description,
        'category', achievement_record.category,
        'icon', achievement_record.icon
      )
    );
    
    updated := true;
  END IF;
  
  RETURN updated;
END;
$$;

-- Function to award an achievement directly
CREATE OR REPLACE FUNCTION public.award_achievement(user_id_param UUID, achievement_id_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record public.achievements%ROWTYPE;
  user_achievement_record public.user_achievements%ROWTYPE;
  awarded BOOLEAN := false;
BEGIN
  -- Get the achievement record
  SELECT * INTO achievement_record FROM public.achievements WHERE id = achievement_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Achievement with ID % not found', achievement_id_param;
  END IF;
  
  -- Check if a user achievement record exists
  SELECT * INTO user_achievement_record 
  FROM public.user_achievements 
  WHERE user_id = user_id_param AND achievement_id = achievement_id_param;
  
  IF FOUND THEN
    -- Only update if not already awarded
    IF NOT user_achievement_record.awarded THEN
      UPDATE public.user_achievements
      SET 
        progress = 1.0,
        awarded = true,
        awarded_at = now()
      WHERE user_id = user_id_param AND achievement_id = achievement_id_param;
      
      awarded := true;
    END IF;
  ELSE
    -- Create new record with awarded status
    INSERT INTO public.user_achievements (
      user_id, 
      achievement_id, 
      progress, 
      awarded,
      awarded_at,
      achievement_data
    )
    VALUES (
      user_id_param, 
      achievement_id_param, 
      1.0,
      true,
      now(),
      jsonb_build_object(
        'title', achievement_record.title,
        'description', achievement_record.description,
        'category', achievement_record.category,
        'icon', achievement_record.icon
      )
    );
    
    awarded := true;
  END IF;
  
  RETURN awarded;
END;
$$;

-- Grant necessary permissions
GRANT USAGE, SELECT ON SEQUENCE public.user_achievements_id_seq TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_achievement TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_achievement_progress TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_achievement TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_achievements TO authenticated;

-- Insert some initial achievement definitions
INSERT INTO public.achievements (id, title, description, category, icon)
VALUES
  ('first-meditation', 'First Meditation', 'Complete your first meditation session', 'meditation', 'award'),
  ('meditation-streak', 'Consistent Mind', 'Complete meditations for 3 days in a row', 'meditation', 'star'),
  ('first-reflection', 'Soul Searcher', 'Write your first reflection', 'reflection', 'check'),
  ('chakra-activation', 'Energy Awakening', 'Activate your first chakra', 'practice', 'trophy'),
  ('wisdom-unlock', 'Ancient Knowledge', 'Unlock your first wisdom insight', 'wisdom', 'star')
ON CONFLICT (id) DO UPDATE
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;
