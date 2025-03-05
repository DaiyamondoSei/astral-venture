
/**
 * Functions for generating recommendations based on chakra analysis
 */

import { chakraNames } from '../mappings';
import { getTimeBasedRecommendation } from './timeBasedRecommendations';
import { generateBalanceRecommendations } from './balanceRecommendations';
import { generatePatternRecommendations } from './patternRecommendations';
import { generateIntensityRecommendations } from './intensityRecommendations';

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
  let recommendations: string[] = [];
  
  // Get recommendations from specialized modules
  recommendations = recommendations.concat(
    generateBalanceRecommendations(activatedChakras, balanceScore),
    generatePatternRecommendations(activatedChakras, intensities),
    generateIntensityRecommendations(activatedChakras, intensities)
  );
  
  // Ensure we have at least one recommendation
  if (recommendations.length === 0) {
    recommendations.push("Continue your current energy practices to maintain chakra development.");
  }
  
  // Add a personalized timestamp element to create uniqueness
  const timeBasedRecommendation = getTimeBasedRecommendation(activatedChakras);
  if (timeBasedRecommendation) {
    recommendations.push(timeBasedRecommendation);
  }
  
  // Return at most 3 recommendations
  return recommendations.slice(0, 3);
};
