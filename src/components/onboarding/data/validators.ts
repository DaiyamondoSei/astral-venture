
import { z } from 'zod';
import { AchievementData } from './types';
import { validateData } from '@/utils/typeValidation';

/**
 * Achievement validator schema using Zod
 */
export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  iconName: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  category: z.string().optional(),
  points: z.number().optional(),
  unlockRequirement: z.string().optional(),
  progress: z.object({
    current: z.number(),
    required: z.number()
  }).optional(),
  isSecret: z.boolean().optional(),
  unlocked: z.boolean().optional(),
  dateUnlocked: z.string().optional(),
  icon: z.string().optional(),
  type: z.enum(['discovery', 'completion', 'interaction', 'streak', 'progressive', 'milestone']).optional(),
  requiredStep: z.string().optional(),
  requiredSteps: z.array(z.string()).optional(),
  requiredInteraction: z.string().optional(),
  streakDays: z.number().optional(),
  progressThreshold: z.number().optional(),
  trackedValue: z.string().optional(),
  tieredLevels: z.array(z.number()).optional(),
  pointsPerTier: z.array(z.number()).optional(),
  basePoints: z.number().optional(),
  tier: z.number().optional()
});

/**
 * Validates an achievement using Zod schema
 * Returns the achievement if valid, null if invalid
 */
export function validateAchievement(achievement: unknown): AchievementData | null {
  return validateData(achievement, achievementSchema, 'Achievement Validation');
}

/**
 * Validates an array of achievements
 * Returns only the valid achievements
 */
export function validateAchievements(achievements: unknown[]): AchievementData[] {
  return achievements
    .map(achievement => validateAchievement(achievement))
    .filter((achievement): achievement is AchievementData => achievement !== null);
}

/**
 * Achievement state schema for validating the state structure
 */
export const achievementStateSchema = z.object({
  unlocked: z.array(achievementSchema),
  inProgress: z.array(achievementSchema),
  recent: z.array(achievementSchema)
});

/**
 * Validates achievement progress
 */
export const achievementProgressSchema = z.object({
  achievementId: z.string(),
  progress: z.number(),
  total: z.number(),
  completed: z.boolean()
});

/**
 * Checks if an achievement is valid for display
 * This helps prevent rendering invalid achievements in the UI
 */
export function isValidForDisplay(achievement: unknown): achievement is AchievementData {
  if (!achievement || typeof achievement !== 'object') return false;
  
  const obj = achievement as Record<string, unknown>;
  
  // Minimal checks for display - must have id, title and description
  return (
    typeof obj.id === 'string' && 
    typeof obj.title === 'string' && 
    typeof obj.description === 'string'
  );
}
