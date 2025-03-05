
/**
 * Functions for generating chakra balance recommendations
 */

import { chakraNames } from '../mappings';

/**
 * Generate recommendations based on chakra balance analysis
 * 
 * @param activatedChakras - Array of activated chakra indices
 * @param balanceScore - Overall chakra balance score (0-1)
 * @returns Array of recommendation strings
 */
export const generateBalanceRecommendations = (
  activatedChakras: number[],
  balanceScore: number
): string[] => {
  const recommendations: string[] = [];
  
  // Check for balance conditions and provide targeted recommendations
  if (balanceScore < 0.4) {
    recommendations.push("Your chakra system shows significant imbalance. Consider practices that target multiple energy centers.");
  }
  
  // Check for inactive chakras
  const inactiveChakras = [0, 1, 2, 3, 4, 5, 6].filter(index => !activatedChakras.includes(index));
  
  if (inactiveChakras.length > 3) {
    recommendations.push("Several chakras show minimal activation. Consider a full chakra balancing practice.");
  } else if (inactiveChakras.length > 0) {
    const inactiveNames = inactiveChakras.map(index => chakraNames[index]).join(", ");
    recommendations.push(`The following chakras could use activation: ${inactiveNames}`);
  }
  
  return recommendations;
};
