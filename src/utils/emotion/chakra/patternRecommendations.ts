
/**
 * Functions for generating recommendations based on chakra activation patterns
 */

/**
 * Generate recommendations based on specific chakra activation patterns
 * 
 * @param activatedChakras - Array of activated chakra indices
 * @param intensities - Array of intensity values for each chakra
 * @returns Array of recommendation strings
 */
export const generatePatternRecommendations = (
  activatedChakras: number[],
  intensities: number[]
): string[] => {
  const recommendations: string[] = [];
  
  // Check for specific chakra patterns and provide deeper wisdom
  if (activatedChakras.includes(2) && activatedChakras.includes(4) && intensities[2] > 0.6 && intensities[4] > 0.6) {
    recommendations.push("The strong connection between your solar plexus and throat chakras indicates a powerful ability to manifest your authentic truth through communication.");
  }
  
  if (activatedChakras.includes(1) && activatedChakras.includes(5) && intensities[1] > 0.5 && intensities[5] > 0.5) {
    recommendations.push("The active flow between your sacral and third eye chakras suggests a fertile connection between creativity and intuition. Creative visualization practices would enhance this connection.");
  }
  
  // Check for specific chakra activation patterns
  if (activatedChakras.includes(3) && activatedChakras.includes(6)) {
    recommendations.push("Your heart and crown connection shows spiritual integration. Continue practices that connect love with higher consciousness.");
  }
  
  if (activatedChakras.includes(5) && intensities[5] > 0.7) {
    recommendations.push("Your strong third eye activation suggests developing intuitive practices would be beneficial.");
  }
  
  if (activatedChakras.includes(0) && activatedChakras.includes(6)) {
    recommendations.push("Your root-crown connection shows good energy flow through the central channel. Continue practices that ground spiritual energy.");
  }
  
  return recommendations;
};
