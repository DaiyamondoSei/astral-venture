
/**
 * Type definitions for achievement data
 */
export interface AchievementData {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  points?: number;
  unlockRequirement?: string;
  progress?: {
    current: number;
    required: number;
  };
  isSecret?: boolean;
  unlocked?: boolean;
  dateUnlocked?: string;
  
  // Additional properties needed based on usage in codebase
  icon?: string;
  type?: 'discovery' | 'completion' | 'interaction' | 'streak' | 'progressive' | 'milestone';
  requiredStep?: string;
  requiredSteps?: string[];
  requiredInteraction?: string;
  streakDays?: number;
  progressThreshold?: number;
  trackedValue?: string;
  tieredLevels?: number[];
  pointsPerTier?: number[];
  basePoints?: number;
  tier?: number;
}

// Types for achievement tracking
export interface AchievementProgress {
  achievementId: string;
  progress: number;
  total: number;
  completed: boolean;
}

export interface AchievementState {
  unlocked: AchievementData[];
  inProgress: AchievementData[];
  recent: AchievementData[];
}

// Additional types used in the codebase
export interface FeatureTooltipData {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  order: number;
  requiredStep?: string;
}

export interface GuidedTourData {
  id: string;
  title: string;
  description: string;
  requiredStep?: string;
  steps: GuidedTourStep[];
}

export interface GuidedTourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

// Progress types
export type ProgressColorScheme = 'default' | 'energy' | 'chakra' | 'cosmic' | 'quantum';
export type ProgressSize = 'sm' | 'md' | 'lg' | 'xl';
export type LabelPosition = 'inside' | 'outside' | 'none';
export type GlowIntensity = 'none' | 'low' | 'medium' | 'high';
export type AnimationStyle = 'none' | 'pulse' | 'flow' | 'wave';

// Add other types that might be missing from the codebase
