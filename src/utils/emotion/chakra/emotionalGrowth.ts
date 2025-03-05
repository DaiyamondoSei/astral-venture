
/**
 * Utilities for calculating emotional growth based on chakra activity
 */

/**
 * Calculate emotional growth based on reflection count
 */
export function calculateEmotionalGrowth(reflectionCount: number): number {
  // Calculate emotional growth (0-100)
  return Math.min(reflectionCount * 10, 100);
}
