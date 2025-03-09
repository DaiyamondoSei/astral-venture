
import { IAchievementData } from '@/components/onboarding/data/types';

// Achievement event types
export enum AchievementEventType {
  REFLECTION_COMPLETED = 'reflection_completed',
  MEDITATION_COMPLETED = 'meditation_completed',
  PRACTICE_COMPLETED = 'practice_completed',
  CHAKRA_ACTIVATED = 'chakra_activated',
  WISDOM_EXPLORED = 'wisdom_explored',
  STREAK_MILESTONE = 'streak_milestone',
  POINTS_MILESTONE = 'points_milestone'
}

// User achievement record in database
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement_data: Partial<IAchievementData>;
  progress: number;
  unlocked_at: string | null;
  created_at: string;
  updated_at: string;
}

// Progress tracking state
export interface ProgressTracking {
  streakDays: number;
  reflections: number;
  meditation_minutes: number;
  chakras_activated: number;
  wisdom_resources_explored: number;
  total_energy_points: number;
  [key: string]: number;
}

// Achievement history record
export interface AchievementHistoryRecord {
  awarded: boolean;
  timestamp: string;
  tier?: number;
}

// Step interaction record
export interface StepInteraction {
  stepId: string;
  interactionType: string;
  timestamp: string;
}
