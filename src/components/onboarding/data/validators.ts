
import { z } from 'zod';

// Create schemas for validation
export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  type: z.enum([
    'discovery', 
    'completion', 
    'interaction', 
    'streak', 
    'progressive', 
    'milestone'
  ]),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  icon: z.string().optional(),
  points: z.number(),
  unlockCondition: z.function().optional(),
  requiresPrior: z.array(z.string()).optional(),
  unlocksNext: z.array(z.string()).optional(),
  completed: z.boolean().optional(),
  progress: z.number().optional(),
  rewards: z.array(z.string()).optional(),
  visible: z.boolean().optional(),
  hideUntilUnlocked: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  completedAt: z.date().optional(),
  thresholds: z.array(z.number()).optional(),
  tier: z.number().optional(),
});

// Create validator functions
export function validateAchievement(data: Record<string, any>): boolean {
  try {
    achievementSchema.parse(data);
    return true;
  } catch (error) {
    console.error('Achievement validation failed:', error);
    return false;
  }
}

export function createDefaultAchievement(): z.infer<typeof achievementSchema> {
  return {
    id: `achievement-${Date.now()}`,
    title: 'New Achievement',
    description: 'Description of the achievement',
    category: 'general',
    type: 'discovery',
    level: 'beginner',
    points: 10
  };
}

// Type for Achievement data from schema
export type IAchievementData = z.infer<typeof achievementSchema>;
