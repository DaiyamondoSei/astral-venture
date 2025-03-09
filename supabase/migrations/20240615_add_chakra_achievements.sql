
-- Add chakra achievements to the achievements table
INSERT INTO public.achievements (id, title, description, category, icon)
VALUES
  ('chakra_first_activation', 'Energy Awakening', 'Activate your first chakra to 50% or higher', 'chakra', 'zap'),
  ('chakra_three_activated', 'Energy Flow', 'Activate three chakras to 50% or higher', 'chakra', 'activity'),
  ('chakra_all_activated', 'Full Spectrum Activation', 'Activate all seven chakras to 50% or higher', 'chakra', 'sparkles'),
  ('chakra_master', 'Chakra Master', 'Activate all seven chakras to 75% or higher', 'chakra', 'sun')
ON CONFLICT (id) DO NOTHING;
