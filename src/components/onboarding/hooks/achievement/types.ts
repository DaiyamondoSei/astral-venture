
// Achievement tracker types

export interface AchievementTrackerProps {
  onUnlock?: (achievement: IAchievementData) => void;
  achievementList?: IAchievementData[];
  completedSteps?: Record<string, boolean>;
  stepInteractions?: any[];
  userId?: string;
  currentStreak?: number;
  reflectionCount?: number;
  meditationMinutes?: number;
  wisdomResourcesCount?: number;
  totalPoints?: number;
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
  trackProgress?: (type: string, amount: number) => void;
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
  
  // Add missing properties needed by useAchievementProgress
  achievements?: IAchievementData[];
  updateAchievement?: (id: string, data: Partial<IAchievementData>) => void;
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
  progress?: number;
  
  requiredStep?: string;
  requiredSteps?: string[];
  requiredInteraction?: string;
  streakDays?: number;
  progressThreshold?: number;
  trackedValue?: string;
  tieredLevels?: number;
  pointsPerTier?: number;
  awarded?: boolean;
}

export interface ProgressTrackingResult {
  earnedPoints: number;
  progress: Record<string, number>;
  didUnlockAchievement: boolean;
  unlockedAchievements: IAchievementData[];
  updated?: boolean;
  
  getProgressValue: (type: string) => number;
  trackProgress: (type: string, amount: number) => void;
  resetProgress: (type: string) => void;
  logActivity: (activityType: string, details?: Record<string, any>) => void;
  trackMultipleProgress: (progressUpdates: Record<string, number>) => void;
}

export enum AchievementEventType {
  STEP_COMPLETED = 'step_completed',
  INTERACTION = 'interaction',
  STREAK_UPDATED = 'streak_updated',
  PROGRESS_TRACKED = 'progress_tracked',
  REFLECTION_COMPLETED = 'reflection_completed',
  MEDITATION_COMPLETED = 'meditation_completed',
  CHAKRA_ACTIVATED = 'chakra_activated',
  WISDOM_EXPLORED = 'wisdom_explored',
  LOGIN_STREAK = 'login_streak',
  ENERGY_MILESTONE = 'energy_milestone',
  ONBOARDING_COMPLETED = 'onboarding_completed',
  PROFILE_COMPLETED = 'profile_completed',
  STREAK_MILESTONE = 'streak_milestone'
}

export interface FeatureTooltipData {
  id: string;
  title: string;
  description: string;
  targetElement: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  hasArrow?: boolean;
  showOnce?: boolean;
  showAfterStep?: string;
  priority?: number;
  condition?: string;
  delay?: number;
  elementId?: string;
  targetSelector: string; // Make required to match data/types.ts
  requiredStep?: string;
}

export interface GuidedTourStep {
  id: string;
  title: string;
  description: string;
  targetElement: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  hasArrow?: boolean;
  highlightElement?: boolean;
  elementId: string;
  target?: string;
  content: string;
  targetSelector: string; // Make required to match TourStep
}

export interface TourStep {
  id: string;
  title: string;
  content: string;
  elementId: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  target?: string;
  targetSelector: string;
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
