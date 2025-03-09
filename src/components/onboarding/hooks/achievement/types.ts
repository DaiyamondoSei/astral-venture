
import { IAchievementData } from '../../data/types';
import { StepInteraction } from '@/types/achievement';

/**
 * Achievement state for managing user progress and earned achievements
 */
export interface AchievementState {
  earnedAchievements: string[];
  achievementHistory: Record<string, any>;
  currentAchievement: string | null;
  progressTracking: Record<string, number>;
}

/**
 * Result object returned by the useProgressTracking hook
 */
export interface ProgressTrackingResult {
  /**
   * Track progress for a specific progress type
   * @param type The progress category to track
   * @param amount The amount to increment (or decrement if negative)
   */
  trackProgress: (type: string, amount: number) => void;
  
  /**
   * Reset a specific progress type to zero
   * @param type The progress category to reset
   */
  resetProgress: (type: string) => void;
  
  /**
   * Log an activity, which updates the appropriate progress tracking
   * @param activityType The type of activity performed
   * @param details Optional details about the activity
   */
  logActivity: (activityType: string, details?: Record<string, any>) => void;
  
  /**
   * Get the current value for a specific progress type
   * @param type The progress category to retrieve
   * @returns The current progress value, or 0 if not found
   */
  getProgressValue: (type: string) => number;
  
  /**
   * Track multiple progress types at once
   * @param progressUpdates Object mapping progress types to amounts
   */
  trackMultipleProgress: (progressUpdates: Record<string, number>) => void;
}

/**
 * The properties for the AchievementTracker hook
 */
export interface AchievementTrackerProps {
  userId?: string;
  onUnlock?: (achievement: IAchievementData) => void;
  onProgress?: (achievement: IAchievementData, progress: number) => void;
  achievementList?: IAchievementData[];
  currentStreak?: number;
  reflectionCount?: number;
  meditationMinutes?: number;
  uniqueChakrasActivated?: number;
  totalPoints?: number;
  wisdomResourcesExplored?: number;
  completedSteps?: Record<string, boolean>;
  stepInteractions?: StepInteraction[];
}

/**
 * The result object returned by the AchievementTracker hook
 */
export interface AchievementTrackerResult {
  earnedAchievements: any[];
  currentAchievement: any;
  dismissAchievement: (id: string) => void;
  trackProgress: (type: string, amount: number) => void;
  logActivity: (activityType: string, details?: Record<string, any>) => void;
  getAchievementProgress: (id: string) => number;
  getTotalPoints: () => number;
  getProgressPercentage: () => number;
  achievementHistory: Record<string, any>;
  progressTracking: Record<string, number>;
}

/**
 * Types of achievement events that can be tracked
 */
export { AchievementEventType } from '@/types/achievement';
