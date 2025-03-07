
/**
 * Type definitions for achievement data
 */

/**
 * Core achievement data type
 * Defines the structure of all achievement objects in the system
 */
export interface IAchievementData {
  /** Unique identifier for the achievement */
  id: string;
  
  /** Display title of the achievement */
  title: string;
  
  /** Detailed description of the achievement */
  description: string;
  
  /** Optional icon name reference */
  iconName?: string;
  
  /** Difficulty level of the achievement */
  level?: 'beginner' | 'intermediate' | 'advanced';
  
  /** Category grouping for the achievement */
  category?: string;
  
  /** Points awarded for unlocking this achievement */
  points?: number;
  
  /** Human-readable requirement description */
  unlockRequirement?: string;
  
  /** Progress tracking data */
  progress?: {
    current: number;
    required: number;
  };
  
  /** Whether this is a hidden achievement */
  isSecret?: boolean;
  
  /** Whether this achievement has been unlocked */
  unlocked?: boolean;
  
  /** ISO date string when achievement was unlocked */
  dateUnlocked?: string;
  
  /** Icon reference (may be a path or component reference) */
  icon?: string;
  
  /** Type of achievement for categorization */
  type?: 'discovery' | 'completion' | 'interaction' | 'streak' | 'progressive' | 'milestone';
  
  /** Specific step required to unlock this achievement */
  requiredStep?: string;
  
  /** Multiple steps required to unlock this achievement */
  requiredSteps?: string[];
  
  /** Specific interaction required to unlock this achievement */
  requiredInteraction?: string;
  
  /** Days of streak required for streak-based achievements */
  streakDays?: number;
  
  /** Threshold for progressive achievements */
  progressThreshold?: number;
  
  /** Property name to track for progress-based achievements */
  trackedValue?: string;
  
  /** Levels for tiered achievements */
  tieredLevels?: number[];
  
  /** Points awarded per tier level */
  pointsPerTier?: number[];
  
  /** Base points for tiered achievements */
  basePoints?: number;
  
  /** Current tier level for the achievement */
  tier?: number;
}

/**
 * Alias for backward compatibility
 * @deprecated Use IAchievementData instead
 */
export type AchievementData = IAchievementData;

/**
 * Achievement progress tracking information
 */
export interface IAchievementProgress {
  /** ID of the achievement being tracked */
  achievementId: string;
  
  /** Current progress value */
  progress: number;
  
  /** Total required value to complete */
  total: number;
  
  /** Whether the achievement is completed */
  completed: boolean;
}

/**
 * Alias for backward compatibility
 * @deprecated Use IAchievementProgress instead
 */
export type AchievementProgress = IAchievementProgress;

/**
 * State of achievements in the system
 */
export interface IAchievementState {
  /** Achievements that have been unlocked */
  unlocked: IAchievementData[];
  
  /** Achievements that are in progress but not yet completed */
  inProgress: IAchievementData[];
  
  /** Recently unlocked achievements for notifications */
  recent: IAchievementData[];
}

/**
 * Alias for backward compatibility
 * @deprecated Use IAchievementState instead
 */
export type AchievementState = IAchievementState;

/**
 * Feature tooltip data structure
 */
export interface IFeatureTooltipData {
  /** Unique identifier for the tooltip */
  id: string;
  
  /** CSS selector for the target element */
  targetSelector: string;
  
  /** Tooltip title */
  title: string;
  
  /** Detailed tooltip description */
  description: string;
  
  /** Positioning of the tooltip relative to the target */
  position: 'top' | 'bottom' | 'left' | 'right';
  
  /** Order for sequential tooltips */
  order: number;
  
  /** Optional step requirement to show this tooltip */
  requiredStep?: string;
}

/**
 * Alias for backward compatibility
 * @deprecated Use IFeatureTooltipData instead
 */
export type FeatureTooltipData = IFeatureTooltipData;

/**
 * Guided tour data structure
 */
export interface IGuidedTourData {
  /** Unique identifier for the tour */
  id: string;
  
  /** Tour title */
  title: string;
  
  /** Tour description */
  description: string;
  
  /** Optional step requirement to enable this tour */
  requiredStep?: string;
  
  /** Steps in the guided tour */
  steps: IGuidedTourStep[];
}

/**
 * Alias for backward compatibility
 * @deprecated Use IGuidedTourData instead
 */
export type GuidedTourData = IGuidedTourData;

/**
 * Individual step in a guided tour
 */
export interface IGuidedTourStep {
  /** Unique identifier for the step */
  id: string;
  
  /** CSS selector for the target element */
  target: string;
  
  /** Step title */
  title: string;
  
  /** Step content/description */
  content: string;
  
  /** Positioning of the step tooltip */
  position: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Alias for backward compatibility
 * @deprecated Use IGuidedTourStep instead
 */
export type GuidedTourStep = IGuidedTourStep;

// Progress types
/**
 * Color scheme for progress components
 */
export type ProgressColorScheme = 'default' | 'energy' | 'chakra' | 'cosmic' | 'quantum';

/**
 * Size options for progress components
 */
export type ProgressSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Label positioning options
 */
export type LabelPosition = 'inside' | 'outside' | 'none';

/**
 * Glow effect intensity options
 */
export type GlowIntensity = 'none' | 'low' | 'medium' | 'high';

/**
 * Animation style options for progress components
 */
export type AnimationStyle = 'none' | 'pulse' | 'flow' | 'wave';
