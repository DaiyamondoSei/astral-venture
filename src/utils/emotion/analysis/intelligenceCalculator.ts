
/**
 * Functions for calculating emotional intelligence based on reflection data
 */

/**
 * Calculate the combined overall emotional intelligence score based on multiple reflections
 */
export function calculateEmotionalIntelligence(
  reflectionCount: number,
  averageEmotionalDepth: number,
  uniqueEmotionsIdentified: number,
  chakrasActivated: number
): number {
  // Base score from reflection count (up to 20 points)
  let score = Math.min(reflectionCount, 20);
  
  // Add points from emotional depth (up to 30 points)
  score += averageEmotionalDepth * 30;
  
  // Add points from unique emotions identified (up to 20 points)
  score += Math.min(uniqueEmotionsIdentified * 5, 20);
  
  // Add points from chakras activated (up to 20 points)
  score += Math.min(chakrasActivated * 3, 20);
  
  // Add bonuses for balanced development (all 7 chakras = 10 points)
  if (chakrasActivated >= 7) {
    score += 10;
  }
  
  return Math.min(score, 100); // Cap at 100
}
