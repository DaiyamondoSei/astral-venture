
-- Add portal achievements to the achievements table
INSERT INTO public.achievements (id, title, description, category, icon)
VALUES
  ('portal_resonance_3', 'Energy Resonator', 'Reach resonance level 3 in the Seed of Life portal', 'portal', 'zap'),
  ('portal_resonance_5', 'Quantum Resonator', 'Master the Seed of Life portal by reaching resonance level 5', 'portal', 'sparkles')
ON CONFLICT (id) DO NOTHING;
