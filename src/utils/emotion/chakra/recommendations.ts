
/**
 * Functions for generating recommendations based on chakra analysis
 */

import { chakraNames } from '../mappings';

/**
 * Generate personalized chakra practice recommendations
 * 
 * @param activatedChakras - Array of activated chakra indices
 * @param intensities - Array of intensity values for each chakra
 * @param balanceScore - Overall chakra balance score (0-1)
 * @returns Array of recommendation strings
 */
export const generateChakraRecommendations = (
  activatedChakras: number[],
  intensities: number[],
  balanceScore: number
): string[] => {
  const recommendations: string[] = [];
  
  // Check for imbalances and provide targeted recommendations
  if (balanceScore < 0.4) {
    recommendations.push("Your chakra system shows significant imbalance. Consider practices that target multiple energy centers.");
  }
  
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
  
  // Check for inactive chakras
  const inactiveChakras = [0, 1, 2, 3, 4, 5, 6].filter(index => !activatedChakras.includes(index));
  
  if (inactiveChakras.length > 3) {
    recommendations.push("Several chakras show minimal activation. Consider a full chakra balancing practice.");
  } else if (inactiveChakras.length > 0) {
    const inactiveNames = inactiveChakras.map(index => chakraNames[index]).join(", ");
    recommendations.push(`The following chakras could use activation: ${inactiveNames}`);
  }
  
  // Add general recommendation based on dominant patterns
  if (activatedChakras.includes(3) && activatedChakras.includes(6)) {
    recommendations.push("Your heart and crown connection shows spiritual integration. Continue practices that connect love with higher consciousness.");
  }
  
  if (activatedChakras.includes(5) && intensities[5] > 0.7) {
    recommendations.push("Your strong third eye activation suggests developing intuitive practices would be beneficial.");
  }
  
  if (activatedChakras.includes(0) && activatedChakras.includes(6)) {
    recommendations.push("Your root-crown connection shows good energy flow through the central channel. Continue practices that ground spiritual energy.");
  }
  
  // Ensure we have at least one recommendation
  if (recommendations.length === 0) {
    recommendations.push("Continue your current energy practices to maintain chakra development.");
  }
  
  // Return at most 3 recommendations
  return recommendations.slice(0, 3);
};
