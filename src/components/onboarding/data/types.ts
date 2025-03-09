
export interface IAchievementData {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  tier: number;
  requiredAmount: number;
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
  condition?: string;
  delay?: number;
  
  // Additional properties used in the codebase
  targetSelector?: string;
  requiredStep?: string;
}

export type AchievementData = IAchievementData;

export interface GuidedTourData {
  id: string;
  title: string;
  steps: GuidedTourStep[];
  condition?: string;
}

export interface GuidedTourStep {
  id: string;
  title: string;
  description: string;
  elementId: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}
