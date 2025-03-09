
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
}

export interface FeatureTooltipData {
  id: string;
  title: string;
  description: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  elementId?: string;
  condition?: string;
  delay?: number;
}

export type AchievementData = IAchievementData;
