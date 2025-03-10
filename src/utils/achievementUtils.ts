
import { validateDefined } from './validation/runtimeValidation';

/**
 * Achievement status types
 */
export type AchievementStatus = 'locked' | 'in-progress' | 'completed';

/**
 * Calculate the percentage of progress towards an achievement
 * 
 * @param current - Current progress value
 * @param target - Target value for completion
 * @returns Progress percentage (0-100)
 */
export function calculateProgressPercentage(current: number, target: number): number {
  // Validate inputs
  validateDefined(current, 'current');
  validateDefined(target, 'target');
  
  if (target <= 0) {
    throw new Error('Target value must be greater than zero');
  }
  
  // Calculate percentage, clamped between 0-100
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  
  // Return rounded percentage
  return Math.round(percentage);
}

/**
 * Determine achievement status based on progress
 * 
 * @param current - Current progress value
 * @param target - Target value for completion
 * @returns Achievement status
 */
export function getAchievementStatus(current: number, target: number): AchievementStatus {
  // Validate inputs
  validateDefined(current, 'current');
  validateDefined(target, 'target');
  
  if (current >= target) {
    return 'completed';
  }
  
  return current > 0 ? 'in-progress' : 'locked';
}

/**
 * Format achievement progress message
 * 
 * @param current - Current progress value
 * @param target - Target value for completion
 * @param format - Format string (optional)
 * @returns Formatted progress message
 */
export function formatProgressMessage(
  current: number, 
  target: number,
  format = '{current}/{target}'
): string {
  // Validate inputs
  validateDefined(current, 'current');
  validateDefined(target, 'target');
  
  // Replace placeholders with values
  return format
    .replace('{current}', String(current))
    .replace('{target}', String(target))
    .replace('{percentage}', `${calculateProgressPercentage(current, target)}%`);
}

/**
 * Check if an achievement is newly completed
 * 
 * @param previousValue - Previous progress value
 * @param currentValue - Current progress value
 * @param targetValue - Target value for completion
 * @returns True if achievement was just completed
 */
export function isNewlyCompleted(
  previousValue: number, 
  currentValue: number, 
  targetValue: number
): boolean {
  return previousValue < targetValue && currentValue >= targetValue;
}

export default {
  calculateProgressPercentage,
  getAchievementStatus,
  formatProgressMessage,
  isNewlyCompleted
};
