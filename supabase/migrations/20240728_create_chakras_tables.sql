
-- Create chakra system table
CREATE TABLE IF NOT EXISTS public.chakra_systems (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create chakra table
CREATE TABLE IF NOT EXISTS public.chakras (
  id TEXT PRIMARY KEY,
  system_id INTEGER REFERENCES public.chakra_systems(id),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for activated chakras
CREATE TABLE IF NOT EXISTS public.activated_chakras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chakra_id TEXT REFERENCES public.chakras(id),
  activation_level INTEGER DEFAULT 1,
  activated_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, chakra_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activated_chakras_user_id ON public.activated_chakras(user_id);
CREATE INDEX IF NOT EXISTS idx_activated_chakras_chakra_id ON public.activated_chakras(chakra_id);

-- Enable row level security
ALTER TABLE public.chakra_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chakras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activated_chakras ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can read chakra systems"
  ON public.chakra_systems FOR SELECT
  USING (true);

CREATE POLICY "Everyone can read chakras"
  ON public.chakras FOR SELECT
  USING (true);

CREATE POLICY "Users can read their activated chakras"
  ON public.activated_chakras FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their activated chakras"
  ON public.activated_chakras FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their activated chakras"
  ON public.activated_chakras FOR UPDATE
  USING (auth.uid() = user_id);

-- Create a function to update the updated_at field automatically
CREATE OR REPLACE FUNCTION update_activated_chakras_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up trigger to update the updated_at column automatically
CREATE TRIGGER update_activated_chakras_modtime
BEFORE UPDATE ON public.activated_chakras
FOR EACH ROW
EXECUTE FUNCTION update_activated_chakras_modified_column();

-- Insert base chakra system
INSERT INTO public.chakra_systems (name, description)
VALUES ('Traditional', 'The traditional seven chakra system')
ON CONFLICT DO NOTHING;

-- Insert base chakras
INSERT INTO public.chakras (id, system_id, name, description, color, location)
VALUES
  ('root', 1, 'Root Chakra', 'Foundation, stability, and security', '#FF0000', 'Base of spine'),
  ('sacral', 1, 'Sacral Chakra', 'Creativity, passion, and emotional balance', '#FFA500', 'Lower abdomen'),
  ('solar', 1, 'Solar Plexus Chakra', 'Personal power, confidence, and self-esteem', '#FFFF00', 'Upper abdomen'),
  ('heart', 1, 'Heart Chakra', 'Love, compassion, and harmony', '#00FF00', 'Center of chest'),
  ('throat', 1, 'Throat Chakra', 'Communication, expression, and truth', '#00FFFF', 'Throat'),
  ('third-eye', 1, 'Third Eye Chakra', 'Intuition, insight, and imagination', '#0000FF', 'Center of forehead'),
  ('crown', 1, 'Crown Chakra', 'Consciousness, enlightenment, and spiritual connection', '#9400D3', 'Top of head')
ON CONFLICT DO NOTHING;

-- Create a function to get activated chakras for a user
CREATE OR REPLACE FUNCTION public.get_activated_chakras(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  chakra_id TEXT,
  activation_level INTEGER,
  activated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  chakra_name TEXT,
  chakra_color TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    ac.id,
    ac.user_id,
    ac.chakra_id,
    ac.activation_level,
    ac.activated_at,
    ac.updated_at,
    c.name AS chakra_name,
    c.color AS chakra_color
  FROM 
    public.activated_chakras ac
  JOIN 
    public.chakras c ON ac.chakra_id = c.id
  WHERE 
    ac.user_id = user_id_param
  ORDER BY 
    c.id;
END;
$$;

-- Grant execute privileges
GRANT EXECUTE ON FUNCTION public.get_activated_chakras TO authenticated;
