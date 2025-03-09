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
