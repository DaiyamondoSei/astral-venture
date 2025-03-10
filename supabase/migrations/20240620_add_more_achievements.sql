
-- Ensure the category field accepts 'portal' and 'chakra' values
ALTER TABLE public.achievements
  DROP CONSTRAINT IF EXISTS achievements_category_check;
  
ALTER TABLE public.achievements
  ADD CONSTRAINT achievements_category_check 
  CHECK (category IN ('meditation', 'practice', 'reflection', 'wisdom', 'special', 'portal', 'chakra'));

-- Add more achievements
INSERT INTO public.achievements (id, title, description, category, icon)
VALUES
  ('meditation_master', 'Meditation Master', 'Complete 10 meditation sessions', 'meditation', 'star'),
  ('chakra_master_root', 'Root Master', 'Fully activate your Root chakra', 'chakra', 'zap'),
  ('chakra_master_crown', 'Crown Master', 'Fully activate your Crown chakra', 'chakra', 'sparkles'),
  ('energy_milestone_1000', 'Energy Adept', 'Reach 1,000 energy points', 'special', 'trophy'),
  ('reflection_insights_5', 'Deep Thinker', 'Get AI insights on 5 different reflections', 'reflection', 'check')
ON CONFLICT (id) DO UPDATE
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;
