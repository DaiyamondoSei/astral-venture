import { 
  ChakraType, 
  ChakraTypes 
} from '@/types/chakra/ChakraSystemTypes';
import { 
  CHAKRA_COLORS, 
  CHAKRA_NAMES,
  EMOTION_TO_CHAKRA_MAP 
} from './constants';

/**
 * Calculate emotional growth based on various metrics
 */
export function calculateEmotionalGrowth(input: any): number {
  // If input is just a number, use a simple equation
  if (typeof input === 'number') {
    // Simple growth equation based just on reflection count
    return Math.min(100, Math.sqrt(input * 20));
  }
  
  // Otherwise, use a more complex equation with multiple factors
  const {
    reflectionCount = 0,
    emotionalDepth = 0,
    activatedChakras = [],
    dominantEmotions = [],
    streakDays = 0
  } = input;
  
  // Base growth from reflection count
  const reflectionBase = Math.sqrt(reflectionCount * 10);
  
  // Bonus from emotional depth (0-5 scale)
  const depthModifier = emotionalDepth * 5;
  
  // Bonus from chakra activations
  const chakraModifier = activatedChakras.length * 3;
  
  // Bonus from emotion diversity
  const emotionModifier = Math.min(10, dominantEmotions.length * 2);
  
  // Bonus from streak
  const streakModifier = Math.min(20, streakDays * 2);
  
  // Calculate total growth (cap at 100)
  const total = reflectionBase + depthModifier + chakraModifier + emotionModifier + streakModifier;
  return Math.min(100, total);
}

/**
 * Analyze chakra activation based on reflections and dominant themes
 */
export function analyzeChakraActivation(reflections: any[], dominantTheme: string | null): {
  chakras: number[];
  dominantThemes: string[];
  recommendations: string[];
} {
  // Default values
  const result = {
    chakras: [],
    dominantThemes: [],
    recommendations: []
  };
  
  // Early return if no data
  if (!reflections || reflections.length === 0) {
    return result;
  }
  
  // Extract dominant emotions from reflections
  const emotions = reflections
    .map(r => r.dominant_emotion)
    .filter(e => !!e);
  
  // Get unique emotions
  const uniqueEmotions = [...new Set(emotions)];
  result.dominantThemes = uniqueEmotions;
  
  // Map emotions to chakras
  const chakraActivations = {
    [ChakraTypes.ROOT]: 0,
    [ChakraTypes.SACRAL]: 0,
    [ChakraTypes.SOLAR]: 0,
    [ChakraTypes.HEART]: 0,
    [ChakraTypes.THROAT]: 0,
    [ChakraTypes.THIRD_EYE]: 0,
    [ChakraTypes.CROWN]: 0
  };
  
  // Process emotions to chakra mapping
  uniqueEmotions.forEach(emotion => {
    const chakraType = mapEmotionToChakra(emotion);
    if (chakraType) {
      chakraActivations[chakraType] += 1;
    }
  });
  
  // Normalize chakra activations to 0-1 range
  const maxActivation = Math.max(1, ...Object.values(chakraActivations));
  
  // Convert to array of activated chakras (indices)
  const chakraTypes: ChakraType[] = [
    ChakraTypes.ROOT,
    ChakraTypes.SACRAL,
    ChakraTypes.SOLAR,
    ChakraTypes.HEART,
    ChakraTypes.THROAT,
    ChakraTypes.THIRD_EYE,
    ChakraTypes.CROWN
  ];
  
  const activatedChakras = chakraTypes
    .map((chakra, index) => ({ chakra, index, value: chakraActivations[chakra] }))
    .filter(item => item.value / maxActivation > 0.5)
    .map(item => item.index);
  
  result.chakras = activatedChakras;
  
  // Generate recommendations based on activated chakras
  result.recommendations = generateRecommendations(activatedChakras, uniqueEmotions);
  
  return result;
}

/**
 * Map an emotion to corresponding chakra
 */
function mapEmotionToChakra(emotion: string): ChakraType | null {
  return EMOTION_TO_CHAKRA_MAP[emotion.toLowerCase()] || null;
}

/**
 * Get chakra intensity based on activation level
 */
export function getChakraIntensity(chakraIndex: number, activatedChakras: number[]): number {
  if (activatedChakras.includes(chakraIndex)) {
    return 1.0; // Fully activated
  }
  
  // Check if adjacent chakras are activated for partial activation
  const isAdjacentActivated = activatedChakras.some(
    idx => Math.abs(idx - chakraIndex) === 1
  );
  
  if (isAdjacentActivated) {
    return 0.5; // Partially activated
  }
  
  return 0.2; // Minimally activated
}

// Export relevant constants
export { CHAKRA_COLORS, CHAKRA_NAMES };

// Export all named functions from visualizationUtils
export * from './visualizationUtils';
