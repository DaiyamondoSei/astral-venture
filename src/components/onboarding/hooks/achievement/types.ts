
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
  getUpcomingAchievements?: () => AchievementData[];
  getAchievementAnalytics?: () => {
    completionRate: number;
    achievementsByType: Record<string, number>;
  };
}

// Define event types for achievement system
export enum AchievementEventType {
  ACHIEVEMENT_EARNED = 'achievement_earned',
  ACHIEVEMENT_PROGRESS = 'achievement_progress',
  MILESTONE_REACHED = 'milestone_reached',
  STREAK_UPDATED = 'streak_updated'
}

export interface AchievementEvent {
  type: AchievementEventType;
  achievementId?: string;
  data?: any;
  timestamp: string;
}

// Define persistence strategy interfaces
export interface AchievementStorageStrategy {
  saveAchievements: (userId: string, achievements: Record<string, any>) => Promise<void>;
  loadAchievements: (userId: string) => Promise<Record<string, any>>;
  saveProgress: (userId: string, progress: Record<string, number>) => Promise<void>;
  loadProgress: (userId: string) => Promise<Record<string, number>>;
  clear: (userId: string) => Promise<void>;
}
