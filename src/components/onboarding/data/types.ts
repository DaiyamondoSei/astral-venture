
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
  type: 'discovery' | 'completion' | 'interaction' | 'streak' | 'progressive' | 'milestone';
  // New fields for advanced achievement types
  streakDays?: number;  // Number of consecutive days required
  progressThreshold?: number; // Percentage or value required to reach
  tieredLevels?: number[]; // For progressive achievements with multiple tiers
  pointsPerTier?: number[]; // Points awarded at each tier level
  basePoints?: number; // Starting point value for tiered achievements
  trackedValue?: string; // What value is being tracked (reflections, meditations, etc.)
  tier?: number; // Current tier level for progressive achievements
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

// Define types for the progress tracking in ProgressTracker
export type ProgressSize = 'sm' | 'md' | 'lg';
export type ProgressColorScheme = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'quantum'
  | `from-quantum-${number} to-quantum-${number}`;

export type GlowIntensity = 'low' | 'medium' | 'high';
export type AnimationStyle = 'none' | 'pulse' | 'slide' | 'ripple';

export interface ProgressTrackerProps {
  progress: number;
  label?: string;
  labelPosition?: LabelPosition;
  showValue?: boolean;
  colorScheme?: ProgressColorScheme;
  size?: ProgressSize;
  glowIntensity?: GlowIntensity;
  animation?: AnimationStyle;
  className?: string;
}

export type LabelPosition = 'top' | 'bottom' | 'left' | 'right' | 'inside';
