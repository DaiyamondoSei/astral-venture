
/**
 * Achievement system type definitions
 */

// Achievement state interface
export interface AchievementState {
  unlockedAchievements: IAchievementData[];
  progress: Record<string, number>;
  recentAchievements: IAchievementData[];
  hasNewAchievements: boolean;
  totalPoints: number;
}

// Achievement tracking result
export interface ProgressTrackingResult {
  updated: boolean;
  unlockedAchievements: IAchievementData[];
  progress: Record<string, number>;
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
