
/**
 * Utility for calculating emotional growth based on reflection data
 */

/**
 * Calculates emotional growth percentage based on various metrics
 * 
 * @param reflectionCount - Number of reflections or an object containing various metrics
 * @returns Growth percentage (0-100)
 */
export function calculateEmotionalGrowth(
  reflectionCountOrMetrics: number | {
    reflectionCount?: number;
    emotionalDepth?: number;
    activatedChakras?: number[];
    dominantEmotions?: string[];
    streakDays?: number;
  }
): number {
  // Handle both simple number input and complex object input
  if (typeof reflectionCountOrMetrics === 'number') {
    // If just a number is provided, use it as reflectionCount
    const reflectionCount = reflectionCountOrMetrics;
    
    // Base score starts at 0
    let growthScore = 0;
    
    // Reflection count contribution (max 30 points)
    // Logarithmic scale to provide diminishing returns
    growthScore += Math.min(Math.log10(reflectionCount + 1) * 15, 30);
    
    // Return the growth score from simple calculation
    return Math.min(Math.round(growthScore), 100);
  }
  
  // Handle the object case (original implementation)
  const {
    reflectionCount = 0,
    emotionalDepth = 0,
    activatedChakras = [],
    dominantEmotions = [],
    streakDays = 0
  } = reflectionCountOrMetrics;
  
  // Base score starts at 0
  let growthScore = 0;
  
  // Reflection count contribution (max 30 points)
  // Logarithmic scale to provide diminishing returns
  growthScore += Math.min(Math.log10(reflectionCount + 1) * 15, 30);
  
  // Emotional depth contribution (max 25 points)
  // Direct linear relationship as emotional depth is already normalized to 0-1
  growthScore += emotionalDepth * 25;
  
  // Chakra activation contribution (max 20 points)
  // More activated chakras = higher score, with all 7 giving maximum points
  const chakraPercentage = activatedChakras.length / 7;
  growthScore += chakraPercentage * 20;
  
  // Emotional variety contribution (max 15 points)
  // More varied emotions = higher score
  const emotionVariety = Math.min(dominantEmotions.length / 5, 1);
  growthScore += emotionVariety * 15;
  
  // Streak contribution (max 10 points)
  // Consistent practice builds emotional growth
  growthScore += Math.min(streakDays / 10, 1) * 10;
  
  // Return the growth score, capped at 100
  return Math.min(Math.round(growthScore), 100);
}
