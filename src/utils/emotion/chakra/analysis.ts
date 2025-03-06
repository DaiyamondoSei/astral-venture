
/**
 * Core chakra analysis functionality
 */

import { EnergyReflection } from '@/services/reflection/types';
import { chakraNames, chakraColors } from '../mappings';
import { ChakraAnalysisResult } from '../types';
import { calculateVariance } from './helpers';
import { generateChakraRecommendations } from './recommendations';

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
  
  // Create chakra balance record
  const chakraBalance: Record<number, number> = {};
  activatedChakras.forEach(chakraIndex => {
    chakraBalance[chakraIndex] = chakraIntensity[chakraIndex];
  });
  
  return {
    chakras: activatedChakras,
    intensity: chakraIntensity,
    dominantChakra,
    balanceScore,
    recommendations,
    dominantThemes: Array.from(dominantThemes),
    emotions: Array.from(dominantThemes),
    insights: recommendations,
    activatedChakras,
    chakraBalance
  };
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
  // Use activatedChakras if available, fallback to chakras for backward compatibility
  const chakras = analysisResult.activatedChakras || analysisResult.chakras || [];
  return chakras.map(index => chakraNames[index] || `Chakra ${index}`);
};
