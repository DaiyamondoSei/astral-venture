
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

export interface ProgressTrackingResult {
  trackProgress: (type: string, amount: number) => void;
  logActivity: (activityType: string, details?: Record<string, any>) => void;
  getProgressValue: (type: string) => number;
}

export interface AchievementProgressResult {
  getAchievementProgress: (achievementId: string) => number;
  getTotalPoints: () => number;
  getProgressPercentage: () => number;
  getNextMilestone: () => number;
}

export interface AchievementTrackerResult {
  earnedAchievements: AchievementData[];
  currentAchievement: AchievementData | null;
  dismissAchievement: (achievementId: string) => void;
  trackProgress: (type: string, amount: number) => void;
  logActivity: (activityType: string, details?: Record<string, any>) => void;
  getAchievementProgress: (achievementId: string) => number;
  getTotalPoints: () => number;
  getProgressPercentage: () => number;
  achievementHistory: Record<string, {awarded: boolean, timestamp: string, tier?: number}>;
  progressTracking: Record<string, number>;
}
