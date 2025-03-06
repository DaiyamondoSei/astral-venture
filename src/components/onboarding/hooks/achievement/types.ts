
import { AchievementData } from '../../data/types';
import { StepInteraction } from '@/contexts/onboarding/types';

export interface AchievementState {
  earnedAchievements: AchievementData[];
  achievementHistory: Record<string, {awarded: boolean, timestamp: string, tier?: number}>;
  currentAchievement: AchievementData | null;
  progressTracking: Record<string, number>;
}

export interface AchievementTrackerProps {
  userId: string;
  completedSteps: Record<string, boolean>;
  stepInteractions: StepInteraction[];
  currentStreak?: number;
  reflectionCount?: number;
  meditationMinutes?: number;
  totalPoints?: number;
  uniqueChakrasActivated?: number;
  wisdomResourcesExplored?: number;
}
