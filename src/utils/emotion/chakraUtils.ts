
/**
 * Chakra Utility Functions
 * 
 * Centralizes chakra-related utility functions
 */
import { ChakraType } from '@/types/chakra/ChakraSystemTypes';
import { CHAKRA_COLOR_MAP, CHAKRA_NAME_MAP, CHAKRA_COLORS, CHAKRA_NAMES } from './constants';

/**
 * Get chakra names for display
 */
export function getChakraNames(): string[] {
  return CHAKRA_NAMES;
}

/**
 * Get chakra colors for visualization
 */
export function getChakraColors(): string[] {
  return CHAKRA_COLORS;
}

/**
 * Get color for a specific chakra
 * @param chakra Chakra type or index
 */
export function getChakraColor(chakra: ChakraType | number): string {
  if (typeof chakra === 'number') {
    return CHAKRA_COLORS[chakra % CHAKRA_COLORS.length];
  }
  return CHAKRA_COLOR_MAP[chakra] || CHAKRA_COLORS[0];
}

/**
 * Get name for a specific chakra
 * @param chakra Chakra type or index
 */
export function getChakraName(chakra: ChakraType | number): string {
  if (typeof chakra === 'number') {
    return CHAKRA_NAMES[chakra % CHAKRA_NAMES.length];
  }
  return CHAKRA_NAME_MAP[chakra] || CHAKRA_NAMES[0];
}

/**
 * Calculate overall chakra balance
 * @param chakras Chakra activation values
 */
export function calculateChakraBalance(chakras: Record<ChakraType, number>): number {
  const values = Object.values(chakras);
  if (values.length === 0) return 0;
  
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  
  // Calculate standard deviation
  const squareDiffs = values.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  const stdDev = Math.sqrt(avgSquareDiff);
  
  // Calculate normalized balance (1 is perfect balance, 0 is totally unbalanced)
  const maxPossibleStdDev = mean; // Theoretical maximum standard deviation
  return Math.max(0, 1 - (stdDev / maxPossibleStdDev));
}

/**
 * Add chakra activations based on reflection content
 * @param baseChakras Base chakra activation levels
 * @param content Reflection content
 */
export function addReflectionBasedChakras(
  baseChakras: Record<ChakraType, number>,
  content: string
): Record<ChakraType, number> {
  const result = { ...baseChakras };
  
  // Map of keywords to chakra types
  const chakraKeywords: Record<ChakraType, string[]> = {
    'root': ['security', 'survival', 'grounding', 'stability', 'safety'],
    'sacral': ['creativity', 'emotion', 'sensation', 'pleasure', 'movement'],
    'solar': ['confidence', 'power', 'control', 'identity', 'transformation'],
    'heart': ['love', 'compassion', 'forgiveness', 'harmony', 'peace'],
    'throat': ['communication', 'expression', 'truth', 'voice', 'speaking'],
    'third-eye': ['intuition', 'insight', 'vision', 'imagination', 'perception'],
    'crown': ['awareness', 'consciousness', 'spirituality', 'connection', 'divine']
  };
  
  // Count keyword matches in content
  Object.entries(chakraKeywords).forEach(([chakra, keywords]) => {
    const chakraType = chakra as ChakraType;
    let matches = 0;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const occurrences = (content.match(regex) || []).length;
      matches += occurrences;
    });
    
    // Add activation based on matches (normalized to 0-1 range)
    if (matches > 0) {
      const activation = Math.min(matches * 0.2, 1); // Cap at 1.0
      result[chakraType] = Math.min(1, (result[chakraType] || 0) + activation);
    }
  });
  
  return result;
}

/**
 * Calculate emotional growth between two chakra states
 * @param previous Previous chakra states
 * @param current Current chakra states
 */
export function calculateEmotionalGrowth(
  previous: Record<ChakraType, number>,
  current: Record<ChakraType, number>
): Record<ChakraType, number> {
  const growth: Record<ChakraType, number> = {} as Record<ChakraType, number>;
  
  Object.keys(current).forEach(key => {
    const chakra = key as ChakraType;
    const prevValue = previous[chakra] || 0;
    const currValue = current[chakra] || 0;
    growth[chakra] = currValue - prevValue;
  });
  
  return growth;
}

/**
 * Get chakra intensity level
 * @param value Chakra activation value (0-1)
 */
export function getChakraIntensity(value: number): 'low' | 'medium' | 'high' {
  if (value < 0.3) return 'low';
  if (value < 0.7) return 'medium';
  return 'high';
}

/**
 * Get chakra resonance between two chakras
 * @param chakra1 First chakra
 * @param chakra2 Second chakra
 * @param activations Chakra activation values
 */
export function getChakraResonance(
  chakra1: ChakraType,
  chakra2: ChakraType,
  activations: Record<ChakraType, number>
): number {
  const activation1 = activations[chakra1] || 0;
  const activation2 = activations[chakra2] || 0;
  
  // Calculate resonance based on activation levels and relationship
  const baseResonance = (activation1 + activation2) / 2;
  
  // Get indices
  const chakraOrder: ChakraType[] = ['root', 'sacral', 'solar', 'heart', 'throat', 'third-eye', 'crown'];
  const index1 = chakraOrder.indexOf(chakra1);
  const index2 = chakraOrder.indexOf(chakra2);
  
  // Apply relationship factors
  const distance = Math.abs(index1 - index2);
  let relationshipFactor = 1;
  
  if (distance === 1) {
    // Adjacent chakras have enhanced resonance
    relationshipFactor = 1.3;
  } else if (distance === 0) {
    // Same chakra has maximum resonance
    relationshipFactor = 1.5;
  } else if (distance === 3) {
    // Opposite chakras can have special resonance (like crown-root, third eye-sacral)
    relationshipFactor = 1.2;
  } else {
    // Decrease with distance
    relationshipFactor = 1 - (distance * 0.1);
  }
  
  return baseResonance * relationshipFactor;
}

/**
 * Normalize chakra data to ensure all required chakras are present
 * @param data Partial chakra data
 */
export function normalizeChakraData(data?: Partial<Record<ChakraType, number>>): Record<ChakraType, number> {
  const result: Record<ChakraType, number> = {
    'root': 0,
    'sacral': 0,
    'solar': 0,
    'heart': 0,
    'throat': 0,
    'third-eye': 0,
    'crown': 0
  };
  
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      if (key in result) {
        result[key as ChakraType] = value;
      }
    });
  }
  
  return result;
}
