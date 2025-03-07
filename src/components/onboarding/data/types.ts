
/**
 * Type definitions for achievement data
 */
export interface AchievementData {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  points?: number;
  unlockRequirement?: string;
  progress?: {
    current: number;
    required: number;
  };
  isSecret?: boolean;
  unlocked?: boolean;
  dateUnlocked?: string;
}

// Types for achievement tracking
export interface AchievementProgress {
  achievementId: string;
  progress: number;
  total: number;
  completed: boolean;
}

export interface AchievementState {
  unlocked: AchievementData[];
  inProgress: AchievementData[];
  recent: AchievementData[];
}
