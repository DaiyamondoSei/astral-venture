
import { validateDefined } from './validation/runtimeValidation';

/**
 * Achievement status types
 */
export type AchievementStatus = 'locked' | 'in-progress' | 'completed';

/**
 * Achievement category types
 */
export type AchievementCategory = 
  | 'meditation'
  | 'practice'
  | 'reflection'
  | 'chakra'
  | 'consciousness'
  | 'portal'
  | 'learning'
  | 'community';

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

/**
 * Get color for achievement category
 * 
 * @param category - Achievement category
 * @returns CSS color string for the category
 */
export function getCategoryColor(category: AchievementCategory): string {
  switch (category) {
    case 'meditation':
      return 'hsl(250, 95%, 70%)'; // Purple
    case 'practice':
      return 'hsl(200, 95%, 50%)'; // Blue
    case 'reflection':
      return 'hsl(170, 80%, 40%)'; // Teal
    case 'chakra':
      return 'hsl(40, 100%, 50%)'; // Gold
    case 'consciousness':
      return 'hsl(280, 90%, 60%)'; // Violet
    case 'portal':
      return 'hsl(320, 80%, 55%)'; // Magenta
    case 'learning':
      return 'hsl(140, 70%, 45%)'; // Green
    case 'community':
      return 'hsl(20, 90%, 55%)'; // Orange
    default:
      return 'hsl(220, 15%, 50%)'; // Neutral slate
  }
}

/**
 * Track achievement progress for a user
 * 
 * @param achievementId - The ID of the achievement to track
 * @param progress - The progress value to add
 * @returns Promise resolving to updated progress percentage
 */
export async function trackAchievementProgress(
  achievementId: string, 
  progress: number
): Promise<number> {
  try {
    // In a real implementation, this would call a Supabase edge function
    // For now, we'll just simulate the behavior
    console.info(`Tracking achievement progress: ${achievementId}, +${progress}`);
    return Math.min(100, Math.round(Math.random() * 100)); // Simulated progress
  } catch (error) {
    console.error("Failed to track achievement progress:", error);
    throw error;
  }
}

/**
 * Get user achievements list
 * 
 * @returns Promise resolving to achievement array
 */
export async function getUserAchievements(): Promise<Achievement[]> {
  try {
    // In a real implementation, this would fetch from Supabase
    // For now, return sample data
    return [
      {
        id: 'first-meditation',
        title: 'First Meditation',
        description: 'Complete your first meditation session',
        category: 'meditation',
        progress: 100,
        target: 1,
        awarded: true,
        awardedAt: new Date().toISOString(),
        icon: 'lotus'
      },
      {
        id: 'reflection-streak',
        title: 'Reflection Streak',
        description: 'Complete 7 consecutive days of reflection',
        category: 'reflection',
        progress: 5,
        target: 7,
        awarded: false,
        icon: 'thinking'
      }
    ];
  } catch (error) {
    console.error("Failed to fetch user achievements:", error);
    return [];
  }
}

/**
 * Achievement data interface
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  progress: number;
  target: number;
  awarded: boolean;
  awardedAt?: string;
  icon?: string;
}

export default {
  calculateProgressPercentage,
  getAchievementStatus,
  formatProgressMessage,
  isNewlyCompleted,
  getCategoryColor,
  trackAchievementProgress,
  getUserAchievements
};
