
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
  
  // Check for specific chakra patterns and provide deeper wisdom
  if (activatedChakras.includes(2) && activatedChakras.includes(4) && intensities[2] > 0.6 && intensities[4] > 0.6) {
    recommendations.push("The strong connection between your solar plexus and throat chakras indicates a powerful ability to manifest your authentic truth through communication.");
  }
  
  if (activatedChakras.includes(1) && activatedChakras.includes(5) && intensities[1] > 0.5 && intensities[5] > 0.5) {
    recommendations.push("The active flow between your sacral and third eye chakras suggests a fertile connection between creativity and intuition. Creative visualization practices would enhance this connection.");
  }
  
  // Add recommendations for overall energy patterns
  const averageIntensity = intensities.reduce((sum, val) => sum + val, 0) / 7;
  
  if (averageIntensity < 0.4 && activatedChakras.length > 3) {
    recommendations.push("Your energy system shows breadth but could benefit from practices to deepen the intensity of activation.");
  } else if (averageIntensity > 0.7 && activatedChakras.length < 4) {
    recommendations.push("Your energy system shows intensity in specific centers. Consider practices to expand activation to other chakras for greater balance.");
  } else if (averageIntensity > 0.6 && activatedChakras.length > 5 && balanceScore > 0.7) {
    recommendations.push("Your energy system shows remarkable balance and activation. Focus on subtle refinement practices to maintain this harmonious state.");
  }
  
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

/**
 * Generate a time-sensitive recommendation that changes based on the time of day
 * This adds an element of uniqueness to each analysis
 * 
 * @param activatedChakras - Array of activated chakra indices
 * @returns A time-specific recommendation or null
 */
const getTimeBasedRecommendation = (activatedChakras: number[]): string | null => {
  const hour = new Date().getHours();
  
  // Morning recommendations (5 AM - 11 AM)
  if (hour >= 5 && hour < 12) {
    if (activatedChakras.includes(0)) {
      return "Morning is an ideal time to ground your root chakra energy through standing poses or earth connection.";
    } else if (activatedChakras.includes(3)) {
      return "The morning hours are excellent for heart-opening practices to set a compassionate tone for your day.";
    }
  }
  // Afternoon recommendations (12 PM - 5 PM)
  else if (hour >= 12 && hour < 18) {
    if (activatedChakras.includes(2)) {
      return "Afternoon is the perfect time to channel your solar plexus energy into purposeful action and personal power.";
    } else if (activatedChakras.includes(4)) {
      return "Express your activated throat chakra energy through afternoon creative communication or singing practices.";
    }
  }
  // Evening recommendations (6 PM - 9 PM)
  else if (hour >= 18 && hour < 22) {
    if (activatedChakras.includes(6)) {
      return "Evening meditation practices can enhance your crown chakra connection to universal consciousness.";
    } else if (activatedChakras.includes(1)) {
      return "Channel your sacral creativity into evening artistic expression or conscious connection with others.";
    }
  }
  // Night recommendations (10 PM - 4 AM)
  else {
    if (activatedChakras.includes(5)) {
      return "Your third eye activation is naturally enhanced during nighttime. Dream journaling or pre-sleep visualization can deepen this connection.";
    } else if (activatedChakras.includes(3)) {
      return "Practice heart-centered breathing before sleep to integrate the day's experiences through your activated heart chakra.";
    }
  }
  
  return null;
};
