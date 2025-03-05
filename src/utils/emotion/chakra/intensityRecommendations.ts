
/**
 * Functions for generating recommendations based on chakra intensity
 */

import { chakraNames } from '../mappings';

/**
 * Generate recommendations based on chakra intensity analysis
 * 
 * @param activatedChakras - Array of activated chakra indices
 * @param intensities - Array of intensity values for each chakra
 * @param balanceScore - Overall chakra balance score (0-1)
 * @returns Array of recommendation strings
 */
export const generateIntensityRecommendations = (
  activatedChakras: number[],
  intensities: number[],
  balanceScore: number
): string[] => {
  const recommendations: string[] = [];
  
  // Find lowest intensity activated chakras
  const weakestChakras = activatedChakras
    .map(index => ({ index, intensity: intensities[index] }))
    .sort((a, b) => a.intensity - b.intensity)
    .slice(0, 2);
  
  // Recommend practices for weakest chakras
  weakestChakras.forEach(({ index, intensity }) => {
    if (intensity < 0.5) {
      recommendations.push(`${chakraNames[index]} chakra could benefit from focused energy work.`);
    }
  });
  
  // Add recommendations for overall energy patterns
  const averageIntensity = intensities.reduce((sum, val) => sum + val, 0) / 7;
  
  if (averageIntensity < 0.4 && activatedChakras.length > 3) {
    recommendations.push("Your energy system shows breadth but could benefit from practices to deepen the intensity of activation.");
  } else if (averageIntensity > 0.7 && activatedChakras.length < 4) {
    recommendations.push("Your energy system shows intensity in specific centers. Consider practices to expand activation to other chakras for greater balance.");
  } else if (averageIntensity > 0.6 && activatedChakras.length > 5 && balanceScore > 0.7) {
    recommendations.push("Your energy system shows remarkable balance and activation. Focus on subtle refinement practices to maintain this harmonious state.");
  }
  
  return recommendations;
};
