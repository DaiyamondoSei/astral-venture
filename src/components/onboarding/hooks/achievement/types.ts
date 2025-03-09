
// Achievement tracker types

export interface AchievementTrackerProps {
  onUnlock?: (achievement: IAchievementData) => void;
  achievementList?: IAchievementData[];
  completedSteps?: Record<string, boolean>;
  stepInteractions?: any[];
  userId?: string;
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
}

export interface GuidedTourStep {
  id: string;
  title: string;
  description: string;
  targetElement: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  hasArrow?: boolean;
  highlightElement?: boolean;
}

export interface GuidedTourData {
  id: string;
  title: string;
  description?: string;
  steps: GuidedTourStep[];
  showOnce?: boolean;
  showAfterLogin?: boolean;
  priority?: number;
}
