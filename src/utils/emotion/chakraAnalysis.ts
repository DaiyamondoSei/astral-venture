
/**
 * Enhanced chakra analysis system with more sophisticated activation detection
 * and visualization capabilities
 */

import { EnergyReflection } from '@/services/reflection/types';
import { chakraNames, chakraColors } from './mappings';

interface ChakraAnalysisResult {
  chakras: number[];          // Indices of activated chakras
  intensity: number[];        // Intensity values for each chakra (0-1)
  dominantChakra: number;     // Index of the most strongly activated chakra
  balanceScore: number;       // Overall chakra balance score (0-1)
  recommendations: string[];  // Practice recommendations based on analysis
  dominantThemes: string[];   // Dominant emotional themes detected
}

/**
 * Analyze chakra activation patterns based on reflections and dream themes
 * 
 * @param reflections - Array of user reflections to analyze
 * @param dominantTheme - Optional dominant dream theme
 * @returns ChakraAnalysisResult with detailed chakra activation information
 */
export const analyzeChakraActivation = (
  reflections: EnergyReflection[],
  dominantTheme: string | null = null
): ChakraAnalysisResult => {
  // Initialize chakra activation counters
  const chakraActivationCount = [0, 0, 0, 0, 0, 0, 0];
  const chakraIntensity = [0, 0, 0, 0, 0, 0, 0];
  let totalActivations = 0;
  const dominantThemes = new Set<string>();
  
  // Process all reflections to build chakra activation patterns
  reflections.forEach(reflection => {
    // Add dominant emotions to themes set
    if (reflection.dominant_emotion) {
      dominantThemes.add(reflection.dominant_emotion);
    }
    
    // Process activated chakras from the reflection
    const activatedChakras = reflection.chakras_activated || [];
    activatedChakras.forEach(chakraIndex => {
      if (chakraIndex >= 0 && chakraIndex < 7) {
        chakraActivationCount[chakraIndex]++;
        
        // Use emotional depth to influence intensity if available
        const depthMultiplier = reflection.emotional_depth !== undefined 
          ? (0.5 + reflection.emotional_depth) 
          : 1;
          
        chakraIntensity[chakraIndex] += 0.2 * depthMultiplier;
        totalActivations++;
      }
    });
  });
  
  // Process dominant theme from dream if available
  if (dominantTheme) {
    switch(dominantTheme.toLowerCase()) {
      case 'love':
      case 'compassion':
      case 'healing':
        chakraIntensity[3] += 0.3; // Heart chakra
        chakraActivationCount[3]++;
        dominantThemes.add('Love');
        break;
      case 'wisdom':
      case 'insight':
      case 'clarity':
        chakraIntensity[5] += 0.3; // Third eye chakra
        chakraActivationCount[5]++;
        dominantThemes.add('Wisdom');
        break;
      case 'power':
      case 'strength':
      case 'confidence':
        chakraIntensity[2] += 0.3; // Solar plexus chakra
        chakraActivationCount[2]++;
        dominantThemes.add('Power');
        break;
      case 'creativity':
      case 'expression':
      case 'flow':
        chakraIntensity[1] += 0.3; // Sacral chakra
        chakraActivationCount[1]++;
        dominantThemes.add('Creativity');
        break;
      case 'peace':
      case 'calm':
      case 'serenity':
        chakraIntensity[4] += 0.3; // Throat chakra
        chakraActivationCount[4]++;
        dominantThemes.add('Peace');
        break;
      case 'spiritual':
      case 'divine':
      case 'connection':
        chakraIntensity[6] += 0.3; // Crown chakra
        chakraActivationCount[6]++;
        dominantThemes.add('Spirituality');
        break;
      case 'grounding':
      case 'stability':
      case 'security':
        chakraIntensity[0] += 0.3; // Root chakra
        chakraActivationCount[0]++;
        dominantThemes.add('Grounding');
        break;
      default:
        // Default to heart chakra for unknown themes
        chakraIntensity[3] += 0.1;
        break;
    }
  }
  
  // Normalize intensities to 0-1 range
  chakraIntensity.forEach((intensity, index) => {
    // Cap at 1.0 maximum intensity
    chakraIntensity[index] = Math.min(intensity, 1.0);
  });
  
  // Determine activated chakras (threshold-based)
  const activatedChakras = chakraActivationCount
    .map((count, index) => ({ index, count }))
    .filter(item => item.count > 0)
    .map(item => item.index);
  
  // Find dominant chakra
  let dominantChakra = 3; // Default to heart chakra
  let maxActivation = 0;
  
  chakraActivationCount.forEach((count, index) => {
    if (count > maxActivation) {
      maxActivation = count;
      dominantChakra = index;
    }
  });
  
  // Calculate chakra balance score
  let balanceScore = 0;
  if (activatedChakras.length > 0) {
    // More balanced when more chakras are activated relatively evenly
    const activationVariance = calculateVariance(chakraActivationCount.filter(c => c > 0));
    const normalizedVariance = Math.min(activationVariance / 5, 1); // Normalize variance
    balanceScore = 1 - normalizedVariance; // Higher score = more balanced
    
    // Bonus for having more chakras activated
    balanceScore += (activatedChakras.length / 7) * 0.3;
    
    // Cap at 1.0
    balanceScore = Math.min(balanceScore, 1.0);
  }
  
  // Generate recommendations based on chakra analysis
  const recommendations = generateChakraRecommendations(
    activatedChakras, 
    chakraIntensity,
    balanceScore
  );
  
  return {
    chakras: activatedChakras,
    intensity: chakraIntensity,
    dominantChakra,
    balanceScore,
    recommendations,
    dominantThemes: Array.from(dominantThemes)
  };
};

/**
 * Get intensity level for a specific chakra
 * 
 * @param chakraIndex - Index of the chakra to check
 * @param analysisResult - Result from analyzeChakraActivation or null
 * @returns Intensity value from 0-1, or 0 if no analysis available
 */
export const getChakraIntensity = (
  chakraIndex: number,
  analysisResult: ChakraAnalysisResult | null = null
): number => {
  if (!analysisResult) return 0;
  
  return analysisResult.intensity[chakraIndex] || 0;
};

/**
 * Get names of activated chakras
 * 
 * @param analysisResult - Result from analyzeChakraActivation
 * @returns Array of chakra names that are activated
 */
export const getActivatedChakraNames = (
  analysisResult: ChakraAnalysisResult
): string[] => {
  return analysisResult.chakras.map(index => chakraNames[index] || `Chakra ${index}`);
};

// Helper function to calculate variance (for balance calculation)
const calculateVariance = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * Generate personalized chakra practice recommendations
 */
const generateChakraRecommendations = (
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
