
-- Create achievement events table for tracking user activities
CREATE TABLE IF NOT EXISTS public.achievement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS achievement_events_user_id_idx ON public.achievement_events(user_id);
CREATE INDEX IF NOT EXISTS achievement_events_event_type_idx ON public.achievement_events(event_type);
CREATE INDEX IF NOT EXISTS achievement_events_created_at_idx ON public.achievement_events(created_at);

-- Add RLS policies
ALTER TABLE public.achievement_events ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own achievement events
CREATE POLICY "Users can view their own achievement events"
  ON public.achievement_events FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own achievement events
CREATE POLICY "Users can insert their own achievement events"
  ON public.achievement_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create user achievements table for tracking unlocked achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  progress DOUBLE PRECISION DEFAULT 0,
  achievement_data JSONB
);

-- Add unique constraint to prevent duplicate achievements
ALTER TABLE public.user_achievements 
  ADD CONSTRAINT user_achievement_unique UNIQUE (user_id, achievement_id);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON public.user_achievements(user_id);

-- Add RLS policies
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own achievements
CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own achievements
CREATE POLICY "Users can update their own achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);
