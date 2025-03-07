
import { AchievementData } from './types';
import { createValidator, ValidationSeverity } from '@/utils/typeValidation';
import { isNonEmptyString, isOneOf, isValidNumber } from '@/utils/typeGuards';

// Sample achievement object with correct types for validation
const achievementSchema: AchievementData = {
  id: '',
  title: '',
  description: '',
  iconName: '',
  level: 'beginner',
  category: '',
  points: 0,
  unlockRequirement: '',
  progress: {
    current: 0,
    required: 0
  },
  isSecret: false,
  unlocked: false,
  dateUnlocked: '',
  icon: '',
  type: 'discovery',
  requiredStep: '',
  requiredSteps: [],
  requiredInteraction: '',
  streakDays: 0,
  progressThreshold: 0,
  trackedValue: '',
  tieredLevels: [],
  pointsPerTier: [],
  basePoints: 0,
  tier: 0,
};

// Achievement validator using the schema
export const validateAchievement = createValidator<AchievementData>(
  achievementSchema,
  { 
    severity: ValidationSeverity.WARNING,
    allowPartial: true, // Allow partial achievements
    logToConsole: true,
    showToast: false
  }
);

/**
 * Additional custom validation for achievements
 */
export function validateAchievementBusiness(achievement: AchievementData): string[] {
  const errors: string[] = [];
  
  // Business rules validation
  if (!isNonEmptyString(achievement.id)) {
    errors.push('Achievement ID must be non-empty');
  }
  
  if (!isNonEmptyString(achievement.title)) {
    errors.push('Achievement title must be non-empty');
  }
  
  if (!isNonEmptyString(achievement.description)) {
    errors.push('Achievement description must be non-empty');
  }
  
  if (achievement.level && !isOneOf(achievement.level, ['beginner', 'intermediate', 'advanced'] as const)) {
    errors.push('Achievement level must be one of: beginner, intermediate, advanced');
  }
  
  if (achievement.type && !isOneOf(achievement.type, [
    'discovery', 'completion', 'interaction', 'streak', 'progressive', 'milestone'
  ] as const)) {
    errors.push('Achievement type must be valid');
  }
  
  if (achievement.points !== undefined && !isValidNumber(achievement.points)) {
    errors.push('Achievement points must be a valid number');
  }
  
  if (achievement.progress) {
    if (!isValidNumber(achievement.progress.current)) {
      errors.push('Achievement progress.current must be a valid number');
    }
    
    if (!isValidNumber(achievement.progress.required)) {
      errors.push('Achievement progress.required must be a valid number');
    }
    
    if (achievement.progress.current > achievement.progress.required) {
      errors.push('Achievement progress.current must not exceed progress.required');
    }
  }
  
  return errors;
}

/**
 * Check if an achievement is complete
 */
export function isAchievementComplete(achievement: AchievementData): boolean {
  if (achievement.unlocked) return true;
  
  if (achievement.progress) {
    return achievement.progress.current >= achievement.progress.required;
  }
  
  return false;
}

/**
 * Calculate achievement progress percentage
 */
export function getAchievementProgress(achievement: AchievementData): number {
  if (achievement.unlocked) return 100;
  
  if (achievement.progress) {
    const { current, required } = achievement.progress;
    if (required === 0) return 0;
    return Math.min(100, Math.floor((current / required) * 100));
  }
  
  return 0;
}
