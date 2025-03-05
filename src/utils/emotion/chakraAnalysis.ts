import { addReflectionBasedChakras } from './chakra/reflectionActivation';
import { evaluateEmotionalDepth } from './analysis/depthEvaluator';
import { analyzeReflectionContent } from './analysis/reflectionContentAnalyzer';
import { calculateEmotionalGrowth } from './chakra/emotionalGrowth';
import { EnergyReflection } from '@/services/reflection/types';

/**
 * Maps common emotions to chakra indices
 */
const emotionToChakraMap: Record<string, number[]> = {
  'security': [0], // Root
  'stability': [0], // Root
  'creativity': [1], // Sacral
  'passion': [1], // Sacral
  'power': [2], // Solar Plexus
  'confidence': [2], // Solar Plexus
  'love': [3], // Heart
  'compassion': [3], // Heart
  'expression': [4], // Throat
  'truth': [4], // Throat
  'intuition': [5], // Third Eye
  'vision': [5], // Third Eye
  'spiritual': [6], // Crown
  'consciousness': [6], // Crown
  // Additional emotion mappings
  'joy': [3, 1], // Heart and Sacral
  'peace': [3, 6], // Heart and Crown
  'wisdom': [5, 6], // Third Eye and Crown
  'healing': [3, 0], // Heart and Root
  'gratitude': [3], // Heart
  'fear': [0, 2], // Root and Solar Plexus
  'anger': [2, 0], // Solar Plexus and Root
  'sadness': [3, 4], // Heart and Throat
};

/**
 * Analyzes chakra activation based on reflections and dream theme
 * @param reflections - Array of user reflections
 * @param dominantTheme - Main emotional theme from dream or overall analysis
 * @returns Object containing activated chakras, emotions, and insights
 */
export function analyzeChakraActivation(
  reflections: EnergyReflection[],
  dominantTheme: string | null
) {
  // Start with empty arrays for our analysis results
  let chakras: number[] = [];
  let emotions: string[] = [];
  let insights: string[] = [];
  
  // Analyze dream theme first
  if (dominantTheme) {
    const lowerTheme = dominantTheme.toLowerCase();
    Object.entries(emotionToChakraMap).forEach(([emotion, relatedChakras]) => {
      if (lowerTheme.includes(emotion)) {
        relatedChakras.forEach(chakraIndex => {
          if (!chakras.includes(chakraIndex)) {
            chakras.push(chakraIndex);
          }
        });
      }
    });
    
    // Add the theme to emotions
    const formattedTheme = dominantTheme.charAt(0).toUpperCase() + dominantTheme.slice(1);
    emotions.push(formattedTheme);
    
    // Add theme-based insight
    insights.push(`Your ${dominantTheme} energy is activating your consciousness.`);
  }
  
  // Analyze reflection content
  if (reflections.length > 0) {
    // Combine all reflection content for analysis
    const combinedReflections = reflections.map(r => r.content).join(' ');
    
    // Process any explicit chakra activations from stored reflection data
    reflections.forEach(reflection => {
      if (reflection.chakras_activated && Array.isArray(reflection.chakras_activated)) {
        reflection.chakras_activated.forEach(chakraIndex => {
          if (!chakras.includes(chakraIndex)) {
            chakras.push(chakraIndex);
          }
        });
      }
      
      // Process dominant emotions from reflections
      if (reflection.dominant_emotion) {
        const formattedEmotion = reflection.dominant_emotion.charAt(0).toUpperCase() + 
                                 reflection.dominant_emotion.slice(1);
        if (!emotions.includes(formattedEmotion)) {
          emotions.push(formattedEmotion);
        }
      }
    });
    
    // Get average emotional depth
    const depthValues = reflections
      .filter(r => r.emotional_depth !== undefined)
      .map(r => r.emotional_depth || 0);
    
    if (depthValues.length > 0) {
      const averageDepth = depthValues.reduce((sum, depth) => sum + depth, 0) / depthValues.length;
      
      // Add depth-based insights
      if (averageDepth > 0.7) {
        insights.push("Your reflections show remarkable emotional depth and self-awareness");
      } else if (averageDepth > 0.4) {
        insights.push("Your emotional depth is developing well through regular practice");
      } else {
        insights.push("Continue your practice to deepen your emotional awareness");
      }
    }
    
    // Add frequency-based insights
    if (reflections.length >= 5) {
      insights.push("Your consistent reflection practice is building emotional awareness");
    }
    
    if (reflections.length >= 10) {
      insights.push("Your dedication to reflection shows commitment to inner growth");
    }
  }
  
  // Add chakras based on reflection count as a fallback
  const reflectionCount = reflections.length;
  if (chakras.length === 0) {
    chakras = addReflectionBasedChakras(reflectionCount, chakras);
  }
  
  // Ensure at least one insight
  if (insights.length === 0) {
    insights.push("Begin your reflection journey to activate your energy centers");
  }
  
  // Cap insights at 5 for readability
  insights = insights.slice(0, 5);
  
  return { chakras, emotions, insights, reflectionCount };
}

/**
 * Determines the intensity of a chakra based on emotional analysis
 * @param chakraIndex - Index of the chakra (0-6)
 * @param activatedChakras - Array of activated chakra indices
 * @param emotionalGrowth - Overall emotional growth percentage (0-100)
 * @returns Intensity value between 0.0 and 1.0
 */
export function getChakraIntensity(
  chakraIndex: number,
  activatedChakras: number[],
  emotionalGrowth: number
): number {
  // Check if this chakra is activated
  if (activatedChakras.includes(chakraIndex)) {
    // If multiple chakras are active, distribute intensity based on position
    // (higher chakras generally indicate advanced practice)
    const activatedCount = activatedChakras.length;
    const position = activatedChakras.indexOf(chakraIndex);
    
    // Give slightly higher intensity to more recently activated chakras
    const baseIntensity = 0.7;
    const positionBonus = (position / activatedCount) * 0.3;
    
    // Scale based on overall emotional growth
    const growthMultiplier = Math.min(0.5 + (emotionalGrowth / 200), 1.0);
    
    return Math.min((baseIntensity + positionBonus) * growthMultiplier, 1.0);
  }
  
  // Otherwise return partial intensity based on emotional growth
  return emotionalGrowth / 200; // Half intensity at most
}

/**
 * Gets chakra names for the activated chakras
 * @param activatedChakras - Array of activated chakra indices
 * @returns Array of chakra names
 */
export function getActivatedChakraNames(activatedChakras: number[]): string[] {
  const chakraNames = [
    'Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'
  ];
  
  return activatedChakras.map(index => chakraNames[index] || 'Unknown');
}
