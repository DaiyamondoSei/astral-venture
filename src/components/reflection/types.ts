
export interface HistoricalReflection {
  id: string | number;
  content: string;
  points_earned?: number;
  created_at: string;
  insights?: string[];
  prompt?: string;
  timestamp?: string;
  type?: string;
  dominant_emotion?: string;
  chakras_activated?: number[];
  emotional_depth?: number;
}
