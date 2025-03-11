
/**
 * Achievement System Types
 * 
 * This module provides type definitions for the achievement system.
 */

import { Brand } from '../../core/base/Branded';

/**
 * Achievement ID type
 */
export type AchievementId = Brand<string, 'achievement-id'>;

/**
 * Achievement types
 */
export enum AchievementType {
  DISCOVERY = 'discovery',
  COMPLETION = 'completion',
  INTERACTION = 'interaction',
  STREAK = 'streak',
  PROGRESSIVE = 'progressive',
  MILESTONE = 'milestone'
}

/**
 * Achievement levels
 */
export enum AchievementLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

/**
 * Achievement categories
 */
export enum AchievementCategory {
  MEDITATION = 'meditation',
  REFLECTION = 'reflection',
  CHAKRA = 'chakra',
  ENERGY = 'energy',
  WISDOM = 'wisdom',
  PRACTICE = 'practice',
  COMMUNITY = 'community',
  EXPLORATION = 'exploration'
}

/**
 * Achievement tracking types
 */
export enum AchievementTrackingType {
  COUNT = 'count',
  DURATION = 'duration',
  COMPLETION = 'completion',
  STREAK = 'streak',
  ACCUMULATION = 'accumulation',
  DISCOVERY = 'discovery'
}

/**
 * Achievement data structure
 */
export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon?: string;
  type: AchievementType;
  category?: AchievementCategory;
  points: number;
  level?: AchievementLevel;
  unlockCriteria?: string;
  trackingType?: AchievementTrackingType;
  requiredAmount?: number;
  secret?: boolean;
  tier?: number;
  progress?: number;
  
  // Extended properties
  requiredStep?: string;
  requiredSteps?: string[];
  requiredInteraction?: string;
  streakDays?: number;
  progressThreshold?: number;
  trackedValue?: string;
  tieredLevels?: number;
  pointsPerTier?: number;
  awarded?: boolean;
}

/**
 * Achievement state for tracking user progress
 */
export interface AchievementState {
  earnedAchievements: Achievement[];
  achievementHistory: Record<string, any>;
  currentAchievement: Achievement | null;
  progressTracking: Record<string, number>;
  unlockedAchievements: Achievement[];
  progress: Record<string, number>;
  recentAchievements: Achievement[];
  hasNewAchievements: boolean;
  totalPoints: number;
  
  // Functions
  displayAchievement?: (achievement: Achievement) => void;
  dismissAchievement?: () => void;
  updateAchievement?: (id: string, data: Partial<Achievement>) => void;
}

/**
 * Achievement tracker props
 */
export interface AchievementTrackerProps {
  onUnlock?: (achievement: Achievement) => void;
  achievementList?: Achievement[];
  completedSteps?: Record<string, boolean>;
  stepInteractions?: any[];
  userId?: string;
  currentStreak?: number;
  reflectionCount?: number;
  meditationMinutes?: number;
  wisdomResourcesCount?: number;
  totalPoints?: number;
}

/**
 * Achievement tracker result
 */
export interface AchievementTrackerResult {
  earnedAchievements: Achievement[];
  currentAchievement: Achievement | null;
  dismissAchievement: () => void;
  getAchievementProgress: (id: string) => number;
  getTotalPoints: () => number;
  getProgressPercentage: () => number;
  achievementHistory: Record<string, any>;
  progressTracking: Record<string, number>;
  trackProgress?: (type: string, amount: number) => void;
}

/**
 * Type guard for Achievement
 */
export function isAchievement(obj: unknown): obj is Achievement {
  return typeof obj === 'object' && 
    obj !== null && 
    'id' in obj && 
    'title' in obj && 
    'description' in obj && 
    'points' in obj && 
    'type' in obj;
}

/**
 * Creates a validated AchievementId
 */
export function createAchievementId(id: string): AchievementId {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid achievement ID: must be a non-empty string');
  }
  return id as AchievementId;
}
