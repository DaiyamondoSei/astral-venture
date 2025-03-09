
// Achievement tracker types

export interface AchievementTrackerProps {
  onUnlock?: (achievement: IAchievementData) => void;
  achievementList?: IAchievementData[];
  completedSteps?: Record<string, boolean>;
  stepInteractions?: any[];
  userId?: string;
  currentStreak?: number;
}

export interface AchievementTrackerResult {
  earnedAchievements: IAchievementData[];
  currentAchievement: IAchievementData | null;
  dismissAchievement: () => void;
  getAchievementProgress: (id: string) => number;
  getTotalPoints: () => number;
  getProgressPercentage: () => number;
  achievementHistory: Record<string, any>;
  progressTracking: Record<string, number>;
}

export interface AchievementState {
  earnedAchievements: IAchievementData[];
  achievementHistory: Record<string, any>;
  currentAchievement: IAchievementData | null;
  progressTracking: Record<string, number>;
  unlockedAchievements: IAchievementData[];
  progress: Record<string, number>;
  recentAchievements: IAchievementData[];
  hasNewAchievements: boolean;
  totalPoints: number;
}

export interface IAchievementData {
  id: string;
  title: string;
  description: string;
  icon?: string;
  type: 'discovery' | 'completion' | 'interaction' | 'streak' | 'progressive' | 'milestone';
  category?: string;
  points: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  unlockCriteria?: string;
  trackingType?: string;
  requiredAmount?: number;
  secret?: boolean;
  tier?: number;
  
  // Additional achievement properties
  requiredStep?: string;
  requiredSteps?: string[];
  requiredInteraction?: string;
  streakDays?: number;
  progressThreshold?: number;
  trackedValue?: string;
  tieredLevels?: number;
  pointsPerTier?: number;
}

export interface ProgressTrackingResult {
  earnedPoints: number;
  progress: Record<string, number>;
  didUnlockAchievement: boolean;
  unlockedAchievements: IAchievementData[];
}

export enum AchievementEventType {
  STEP_COMPLETED = 'step_completed',
  INTERACTION = 'interaction',
  STREAK_UPDATED = 'streak_updated',
  PROGRESS_TRACKED = 'progress_tracked'
}

export interface FeatureTooltipData {
  id: string;
  title: string;
  description: string;
  targetElement: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  hasArrow?: boolean;
  showOnce?: boolean;
  showAfterStep?: string;
  priority?: number;
  
  // Additional properties
  condition?: string;
  delay?: number;
  elementId?: string;
  targetSelector?: string;
  requiredStep?: string;
}

export interface GuidedTourStep {
  id: string;
  title: string;
  description: string;
  targetElement: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  hasArrow?: boolean;
  highlightElement?: boolean;
  elementId?: string;
  target?: string;
  content?: string;
}

export interface TourStep {
  id: string;
  title: string;
  content: string;
  elementId: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  target?: string;
}

export interface GuidedTourData {
  id: string;
  title: string;
  description?: string;
  steps: GuidedTourStep[];
  showOnce?: boolean;
  showAfterLogin?: boolean;
  priority?: number;
  condition?: string;
  requiredStep?: string;
}
