
import { Json } from '@/integrations/supabase/types';

export interface EnergyReflection {
  id: string;
  created_at: string;
  user_id: string;
  content: string;
  points_earned: number;
  dominant_emotion?: string;
  emotional_depth?: number;
  chakras_activated?: number[];
}

export interface EmotionalJourney {
  recentReflectionCount: number;
  totalPointsEarned: number;
  averageEmotionalDepth: number;
  activatedChakras: number[];
  dominantEmotions: string[];
  lastReflectionDate: string | null;
  emotionalAnalysis: any;
  recentReflections: EnergyReflection[];
}
