
export interface IAchievementData {
  id: string;
  title: string;
  description: string;
  icon?: string; // Make icon optional to match hook/achievement/types
  category?: string;
  points: number;
  tier?: number;
  requiredAmount?: number;
  progress?: number;
  trackingType?: string;
  awarded?: boolean;
  unlockCriteria?: string;
  
  // Additional properties used in the codebase
  type?: string;
  requiredStep?: string;
  requiredSteps?: string[];
  requiredInteraction?: string;
  streakDays?: number;
  progressThreshold?: number;
  trackedValue?: string;
  tieredLevels?: number;
  pointsPerTier?: number;
}

export interface FeatureTooltipData {
  id: string;
  title: string;
  description: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  elementId?: string;
  targetElement: string; // Required property
  targetSelector: string; // Required property
  condition?: string;
  delay?: number;
  
  // Additional properties
  requiredStep?: string;
}

export type AchievementData = IAchievementData;

export interface GuidedTourData {
  id: string;
  title: string;
  description?: string;
  steps: GuidedTourStep[];
  condition?: string;
  requiredStep?: string;
}

export interface GuidedTourStep {
  id: string;
  title: string;
  description: string;
  elementId: string;
  targetElement: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  content?: string;
  target?: string;
  targetSelector: string; // Required property
}

export interface TourStep {
  id: string;
  title: string;
  content: string;
  elementId: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  target?: string;
  targetSelector: string; // Required property
}
