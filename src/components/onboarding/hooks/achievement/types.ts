
/**
 * Achievement system type definitions
 */

// Achievement state interface
export interface AchievementState {
  unlockedAchievements: IAchievementData[];
  earnedAchievements: string[]; // For backward compatibility
  progress: Record<string, number>;
  recentAchievements: IAchievementData[];
  hasNewAchievements: boolean;
  totalPoints: number;
  achievementHistory: Record<string, any>; // Added for compatibility
  currentAchievement: string | null; // Added for compatibility
  progressTracking: Record<string, number>; // Added for compatibility
}

// Achievement tracking result
export interface ProgressTrackingResult {
  updated: boolean;
  unlockedAchievements: IAchievementData[];
  progress: Record<string, number>;
  trackProgress?: (type: string, amount: number) => void; // Added for compatibility
  resetProgress?: (type: string) => void; // Added for compatibility
  logActivity?: (activityType: string, details?: Record<string, any>) => void; // Added for compatibility
  getProgressValue?: (type: string) => number; // Added for compatibility
  trackMultipleProgress?: (progressUpdates: Record<string, number>) => void; // Added for compatibility
}

// Achievement type enum
export enum AchievementType {
  DISCOVERY = 'discovery',
  COMPLETION = 'completion',
  INTERACTION = 'interaction',
  STREAK = 'streak',
  PROGRESSIVE = 'progressive',
  MILESTONE = 'milestone'
}

// Achievement event type enum (for tracking activities)
export enum AchievementEventType {
  REFLECTION_COMPLETED = 'reflection_completed',
  MEDITATION_COMPLETED = 'meditation_completed',
  CHAKRA_ACTIVATED = 'chakra_activated',
  WISDOM_EXPLORED = 'wisdom_explored',
  STREAK_MILESTONE = 'streak_milestone'
}

// Achievement tracker props
export interface AchievementTrackerProps {
  achievementList?: IAchievementData[];
  onUnlock?: (achievement: IAchievementData) => void;
  onProgress?: (achievement: IAchievementData, progress: number) => void;
}

// Achievement tracker result
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
  logActivity?: (activityType: string, details?: Record<string, any>) => void;
}

// Achievement data interface
export interface IAchievementData {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  tier: number;
  requiredAmount: number;
  
  // Optional fields
  progress?: number;
  type?: string;
  trackingType?: string;
  awarded?: boolean;
  unlockCriteria?: string;
  requiredStep?: string;
  requiredSteps?: string[];
  requiredInteraction?: string;
  streakDays?: number;
  progressThreshold?: number;
  trackedValue?: string;
  tieredLevels?: number;
  pointsPerTier?: number;
}

// Tour step for guided tours
export interface TourStep {
  id: string;
  title: string;
  content: string;
  elementId: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  target?: string; // Optional for backward compatibility
}

// Feature tooltip data
export interface FeatureTooltipData {
  id: string;
  title: string;
  description: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  elementId?: string;
  condition?: string;
  delay?: number;
  targetSelector?: string;
  requiredStep?: string;
  order?: number; // Optional for backward compatibility
}

// Guided tour data
export interface GuidedTourData {
  id: string;
  title: string;
  steps: TourStep[];
  condition?: string;
  requiredStep?: string; // Optional for backward compatibility
  description?: string; // Optional for backward compatibility
}
