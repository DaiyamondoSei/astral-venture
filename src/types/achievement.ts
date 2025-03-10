
/**
 * Achievement categories
 */
export type AchievementCategory = 
  | 'meditation'
  | 'reflection'
  | 'practice'
  | 'chakra'
  | 'learning'
  | 'exploration'
  | 'social';

/**
 * Achievement difficulty levels
 */
export type AchievementDifficulty = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'master';

/**
 * Achievement data structure
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon?: string;
  unlocked: boolean;
  progress?: number;
  difficulty?: AchievementDifficulty;
  createdAt?: string;
  unlockedAt?: string;
  requiredCount?: number;
  currentCount?: number;
}

/**
 * Achievement progress data
 */
export interface AchievementProgress {
  achievementId: string;
  progress: number;
  awarded: boolean;
  awardedAt?: string;
}

/**
 * User interaction data for tracking achievement progress
 */
export interface UserInteraction {
  type: string;
  value?: number | string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Achievement event data
 */
export interface AchievementEvent {
  achievementId: string;
  userId: string;
  progress: number;
  awarded: boolean;
  timestamp: string;
}

/**
 * Step interaction for incremental achievements
 */
export interface StepInteraction {
  stepId: string;
  completed: boolean;
  timestamp: string;
}

/**
 * Achievement notification props
 */
export interface AchievementNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
}
