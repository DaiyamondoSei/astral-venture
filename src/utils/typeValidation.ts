
import { z } from 'zod';
import { AchievementData } from '@/components/onboarding/data/types';
import { toast } from '@/components/ui/use-toast';
import { captureException } from './errorHandling';

/**
 * Runtime type validation utilities to complement TypeScript's compile-time checks
 */

/**
 * Type guard for checking if a value is a valid AchievementData object
 */
export function isAchievementData(value: unknown): value is AchievementData {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  
  // Required properties
  if (typeof obj.id !== 'string') return false;
  if (typeof obj.title !== 'string') return false;
  if (typeof obj.description !== 'string') return false;
  
  // Optional properties with type checks
  if ('iconName' in obj && obj.iconName !== undefined && typeof obj.iconName !== 'string') return false;
  if ('level' in obj && obj.level !== undefined && !['beginner', 'intermediate', 'advanced'].includes(obj.level as string)) return false;
  if ('category' in obj && obj.category !== undefined && typeof obj.category !== 'string') return false;
  if ('points' in obj && obj.points !== undefined && typeof obj.points !== 'number') return false;
  if ('unlockRequirement' in obj && obj.unlockRequirement !== undefined && typeof obj.unlockRequirement !== 'string') return false;
  
  // Validate progress if present
  if ('progress' in obj && obj.progress !== undefined) {
    const progress = obj.progress as Record<string, unknown>;
    if (typeof progress !== 'object' || progress === null) return false;
    if (typeof progress.current !== 'number') return false;
    if (typeof progress.required !== 'number') return false;
  }
  
  // Additional properties based on codebase usage
  if ('icon' in obj && obj.icon !== undefined && typeof obj.icon !== 'string') return false;
  if ('type' in obj && obj.type !== undefined) {
    const validTypes = ['discovery', 'completion', 'interaction', 'streak', 'progressive', 'milestone'];
    if (!validTypes.includes(obj.type as string)) return false;
  }
  
  return true;
}

/**
 * Schema-based validator using Zod
 * This provides more detailed validation errors than the type guard
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
  try {
    return achievementSchema.parse(achievement) as AchievementData;
  } catch (error) {
    console.error('Invalid achievement data:', error);
    return null;
  }
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
 * Generic runtime type checker that combines TypeScript and Zod
 * @param value The value to check
 * @param schema The Zod schema to validate against
 * @param errorContext Context for error reporting
 * @returns The validated value or null if invalid
 */
export function validateData<T>(
  value: unknown, 
  schema: z.ZodType<T>,
  errorContext: string
): T | null {
  try {
    return schema.parse(value) as T;
  } catch (error) {
    captureException(error, `Type validation error in ${errorContext}`);
    console.error(`Type validation error in ${errorContext}:`, error);
    return null;
  }
}

/**
 * Safe data accessor that validates data before returning it
 * @param data The data to access
 * @param schema The schema to validate against
 * @param defaultValue The default value to return if validation fails
 * @param context Context for error reporting
 * @returns The validated data or default value
 */
export function safeDataAccess<T>(
  data: unknown, 
  schema: z.ZodType<T>, 
  defaultValue: T,
  context: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    console.warn(`Data validation failed in ${context}, using default value`);
    return defaultValue;
  }
}

/**
 * Validates data and shows a toast notification if invalid
 */
export function validateWithFeedback<T>(
  data: unknown,
  schema: z.ZodType<T>,
  context: string
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error(`Validation error in ${context}:`, error);
    
    toast({
      title: "Data validation error",
      description: `There was an issue with the data in ${context}. Using default values.`,
      variant: "destructive"
    });
    
    return null;
  }
}
