
-- Create daily challenges table
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  difficulty TEXT,
  points INTEGER DEFAULT 10,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_challenges_user_id ON public.daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON public.daily_challenges(date);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_completed ON public.daily_challenges(completed);

-- Enable row level security
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their daily challenges"
  ON public.daily_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their daily challenges"
  ON public.daily_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their daily challenges"
  ON public.daily_challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- Create a function to update the updated_at field automatically
CREATE OR REPLACE FUNCTION update_daily_challenges_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up trigger to update the updated_at column automatically
CREATE TRIGGER update_daily_challenges_modtime
BEFORE UPDATE ON public.daily_challenges
FOR EACH ROW
EXECUTE FUNCTION update_daily_challenges_modified_column();

-- Create a function to get today's challenge for a user
CREATE OR REPLACE FUNCTION public.get_todays_challenge(user_id_param UUID)
RETURNS SETOF public.daily_challenges
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today DATE := current_date;
BEGIN
  -- Check if user already has a challenge for today
  IF EXISTS (
    SELECT 1 FROM public.daily_challenges
    WHERE user_id = user_id_param AND date = today
  ) THEN
    -- Return existing challenge
    RETURN QUERY 
    SELECT * FROM public.daily_challenges 
    WHERE user_id = user_id_param AND date = today;
  ELSE
    -- Generate a new random challenge
    INSERT INTO public.daily_challenges (
      user_id,
      date,
      title,
      description,
      type,
      difficulty,
      points
    )
    VALUES (
      user_id_param,
      today,
      CASE floor(random() * 4)
        WHEN 0 THEN 'Mindful Breathing'
        WHEN 1 THEN 'Gratitude Reflection'
        WHEN 2 THEN 'Energy Meditation'
        WHEN 3 THEN 'Chakra Activation'
      END,
      CASE floor(random() * 4)
        WHEN 0 THEN 'Take five minutes to focus on your breath and clear your mind.'
        WHEN 1 THEN 'Write down three things you are grateful for today.'
        WHEN 2 THEN 'Spend ten minutes visualizing energy flowing through your body.'
        WHEN 3 THEN 'Focus on activating and balancing one of your chakras.'
      END,
      CASE floor(random() * 3)
        WHEN 0 THEN 'meditation'
        WHEN 1 THEN 'reflection'
        WHEN 2 THEN 'practice'
      END,
      CASE floor(random() * 3)
        WHEN 0 THEN 'easy'
        WHEN 1 THEN 'medium'
        WHEN 2 THEN 'hard'
      END,
      CASE floor(random() * 3)
        WHEN 0 THEN 10
        WHEN 1 THEN 25
        WHEN 2 THEN 50
      END
    );
    
    -- Return the newly created challenge
    RETURN QUERY 
    SELECT * FROM public.daily_challenges 
    WHERE user_id = user_id_param AND date = today;
  END IF;
END;
$$;

-- Create a function to complete a daily challenge
CREATE OR REPLACE FUNCTION public.complete_daily_challenge(user_id_param UUID, challenge_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  challenge_record public.daily_challenges;
  points_earned INTEGER;
BEGIN
  -- Get the challenge
  SELECT * INTO challenge_record
  FROM public.daily_challenges
  WHERE id = challenge_id_param AND user_id = user_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Challenge not found'
    );
  END IF;
  
  IF challenge_record.completed THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Challenge already completed'
    );
  END IF;
  
  -- Update the challenge
  UPDATE public.daily_challenges
  SET 
    completed = true,
    completed_at = now()
  WHERE id = challenge_id_param;
  
  -- Award energy points
  points_earned := challenge_record.points;
  
  UPDATE public.user_profiles
  SET 
    energy_points = energy_points + points_earned,
    last_active_at = now()
  WHERE id = user_id_param;
  
  -- Return success response
  RETURN json_build_object(
    'success', true,
    'message', 'Challenge completed',
    'points_earned', points_earned
  );
END;
$$;

-- Grant execute privileges
GRANT EXECUTE ON FUNCTION public.get_todays_challenge TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_daily_challenge TO authenticated;
