
/**
 * Achievement categories
 */
export type AchievementCategory = 
  | 'meditation'
  | 'chakra'
  | 'reflection'
  | 'practice'
  | 'portal'
  | 'wisdom'
  | 'consciousness'
  | 'special';

/**
 * Icon types for achievements
 */
export type AchievementIcon = 
  | 'star'
  | 'award'
  | 'brain'
  | 'flame'
  | 'energy'
  | 'book'
  | 'sparkles';

/**
 * Achievement data structure
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  target?: number;
  progress?: number;
  awarded?: boolean;
  awarded_at?: string | null;
  icon?: AchievementIcon;
  secret?: boolean;
}

/**
 * Achievement with user progress
 */
export interface UserAchievement extends Achievement {
  progress: number;
  awarded: boolean;
  awarded_at: string | null;
}

/**
 * Achievement progress event
 */
export interface AchievementProgressEvent {
  achievement_id: string;
  progress: number;
  metadata?: Record<string, unknown>;
}

/**
 * Achievement notification data
 */
export interface AchievementNotification {
  achievement: Achievement;
  isNew: boolean;
  timestamp: Date;
}

/**
 * Achievement filter options
 */
export interface AchievementFilterOptions {
  categories?: AchievementCategory[];
  showAwarded?: boolean;
  showUnawarded?: boolean;
  sortBy?: 'recent' | 'progress' | 'category';
}
