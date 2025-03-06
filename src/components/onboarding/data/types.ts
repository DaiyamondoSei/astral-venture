
// Common type definitions for onboarding data

export interface AchievementData {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredStep?: string;
  requiredInteraction?: string;
  requiredSteps?: string[];
  points: number;
  type: 'discovery' | 'completion' | 'interaction';
}

export interface FeatureTooltipData {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  order: number;
  requiredStep?: string;
}

export interface GuidedTourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

export interface GuidedTourData {
  id: string;
  title: string;
  description: string;
  steps: GuidedTourStep[];
  requiredStep?: string;
}
