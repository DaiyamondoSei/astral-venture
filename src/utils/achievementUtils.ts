
import { validateDefined, validateNumber } from './validation/runtimeValidation';

/**
 * Calculate progress percentage for an achievement
 * 
 * @param current Current progress value
 * @param target Target progress value
 * @returns Progress percentage (0-100)
 */
export function calculateProgressPercentage(current: number, target: number): number {
  // Validate inputs
  const validatedCurrent = validateNumber(current, 'current');
  const validatedTarget = validateNumber(target, 'target');
  
  // Prevent division by zero
  if (validatedTarget === 0) return 100;
  
  // Calculate percentage and ensure it's within 0-100 range
  const percentage = Math.min(100, Math.max(0, (validatedCurrent / validatedTarget) * 100));
  
  return Math.round(percentage);
}

/**
 * Get icon name for an achievement category
 * 
 * @param category Achievement category
 * @returns Icon name for the category
 */
export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'meditation':
      return 'zen';
    case 'chakra':
      return 'energy';
    case 'reflection':
      return 'book';
    case 'practice':
      return 'flame';
    case 'portal':
      return 'portal';
    case 'wisdom':
      return 'brain';
    case 'consciousness':
      return 'eye';
    case 'special':
      return 'star';
    default:
      return 'award';
  }
}

/**
 * Format time elapsed since achievement was awarded
 * 
 * @param timestamp Timestamp when achievement was awarded
 * @returns Formatted time string
 */
export function formatAchievementTime(timestamp: string | Date): string {
  if (!timestamp) return 'Just now';
  
  const awardedAt = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - awardedAt.getTime();
  
  // Convert to minutes, hours, days
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  // Format date for older achievements
  return awardedAt.toLocaleDateString();
}

/**
 * Safely get achievement progress or return zero
 * 
 * @param achievement Achievement object
 * @returns Current progress value or 0 if not found
 */
export function getAchievementProgress(achievement: any): number {
  if (!achievement) return 0;
  return typeof achievement.progress === 'number' ? achievement.progress : 0;
}

/**
 * Safely get achievement target or default to 1
 * 
 * @param achievement Achievement object
 * @returns Target progress value or 1 if not found
 */
export function getAchievementTarget(achievement: any): number {
  if (!achievement?.target && achievement?.target !== 0) return 1;
  return typeof achievement.target === 'number' ? achievement.target : 1;
}
