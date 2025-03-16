
/**
 * Chakra utility functions for emotion and energy system
 */
import { 
  ChakraType, 
  ChakraStatus, 
  EnergyLevel 
} from '@/types/chakra/ChakraSystemTypes';
import { 
  ChakraTypes, 
  CHAKRA_COLORS, 
  CHAKRA_NAMES,
  CHAKRA_COLOR_MAP,
  CHAKRA_NAME_MAP
} from '@/types/chakra/constants';

/**
 * Get all chakra names
 */
export function getChakraNames(): string[] {
  return CHAKRA_NAMES;
}

/**
 * Get all chakra colors
 */
export function getChakraColors(): string[] {
  return CHAKRA_COLORS;
}

/**
 * Get color for specific chakra
 */
export function getChakraColor(chakraType: ChakraType): string {
  return CHAKRA_COLOR_MAP[chakraType] || '#FFFFFF';
}

/**
 * Get name for specific chakra
 */
export function getChakraName(chakraType: ChakraType): string {
  return CHAKRA_NAME_MAP[chakraType] || 'Unknown';
}

/**
 * Calculate chakra balance from activation states
 */
export function calculateChakraBalance(chakraStates: Record<ChakraType, ChakraStatus>): number {
  // Get all chakra activation levels
  const activationLevels = Object.values(chakraStates).map(state => state.activationLevel);
  
  if (activationLevels.length === 0) return 0;
  
  // Calculate average
  const sum = activationLevels.reduce((acc, level) => acc + level, 0);
  const avg = sum / activationLevels.length;
  
  // Calculate standard deviation to measure balance
  const squaredDiffs = activationLevels.map(level => Math.pow(level - avg, 2));
  const avgSquaredDiff = squaredDiffs.reduce((acc, diff) => acc + diff, 0) / squaredDiffs.length;
  const stdDev = Math.sqrt(avgSquaredDiff);
  
  // Convert to a 0-100 balance score (lower deviation = better balance)
  // Max deviation would be if all chakras were at 0 except one at 100
  const maxPossibleStdDev = 50; // Approximate maximum standard deviation
  const balance = 100 - (stdDev / maxPossibleStdDev * 100);
  
  // Ensure result is between 0 and 100
  return Math.max(0, Math.min(100, balance));
}

/**
 * Add chakra activations based on reflection content
 */
export function addReflectionBasedChakras(
  reflectionText: string,
  currentActivations: Record<ChakraType, number>
): Record<ChakraType, number> {
  const result = { ...currentActivations };
  
  // Simple keyword-based analysis
  const keywords = {
    [ChakraTypes.ROOT]: ['grounded', 'secure', 'safety', 'survival', 'stability'],
    [ChakraTypes.SACRAL]: ['creative', 'emotion', 'pleasure', 'sensation', 'feeling'],
    [ChakraTypes.SOLAR]: ['confident', 'power', 'control', 'self-esteem', 'will'],
    [ChakraTypes.HEART]: ['love', 'compassion', 'forgiveness', 'acceptance', 'relationship'],
    [ChakraTypes.THROAT]: ['expression', 'truth', 'communication', 'voice', 'speak'],
    [ChakraTypes.THIRD_EYE]: ['insight', 'intuition', 'vision', 'imagination', 'perception'],
    [ChakraTypes.CROWN]: ['awareness', 'consciousness', 'universal', 'spiritual', 'divine']
  };
  
  const lowerText = reflectionText.toLowerCase();
  
  // Check for keywords in the reflection
  Object.entries(keywords).forEach(([chakra, words]) => {
    const chakraType = chakra as ChakraType;
    const matchCount = words.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex) || [];
      return count + matches.length;
    }, 0);
    
    // Add activation based on matches
    if (matchCount > 0) {
      result[chakraType] = (result[chakraType] || 0) + (matchCount * 5);
    }
  });
  
  return result;
}

/**
 * Calculate emotional growth based on chakra changes
 */
export function calculateEmotionalGrowth(
  previous: Record<ChakraType, number>,
  current: Record<ChakraType, number>
): number {
  // Get total activation for both states
  const previousTotal = Object.values(previous).reduce((sum, val) => sum + val, 0);
  const currentTotal = Object.values(current).reduce((sum, val) => sum + val, 0);
  
  // Calculate change as a percentage
  if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
  
  const growthPercent = ((currentTotal - previousTotal) / previousTotal) * 100;
  
  // Cap at reasonable bounds
  return Math.max(-100, Math.min(100, growthPercent));
}

/**
 * Get intensity value for a chakra
 */
export function getChakraIntensity(
  chakraType: ChakraType,
  chakraStates: Record<ChakraType, ChakraStatus>
): number {
  const chakra = chakraStates[chakraType];
  if (!chakra) return 0;
  
  return chakra.activationLevel * (1 - chakra.blockages / 10);
}

/**
 * Get resonance between two chakras
 */
export function getChakraResonance(
  chakra1: ChakraType,
  chakra2: ChakraType,
  chakraStates: Record<ChakraType, ChakraStatus>
): number {
  const state1 = chakraStates[chakra1];
  const state2 = chakraStates[chakra2];
  
  if (!state1 || !state2) return 0;
  
  // Simplified resonance calculation
  const activationDiff = Math.abs(state1.activationLevel - state2.activationLevel);
  const blockageDiff = Math.abs(state1.blockages - state2.blockages);
  
  // Closer activation levels and blockages = higher resonance
  return 100 - (activationDiff + blockageDiff) * 5;
}

/**
 * Normalize chakra data for visualizations
 */
export function normalizeChakraData(
  chakraStates: Record<ChakraType, ChakraStatus>
): Record<ChakraType, number> {
  const result: Record<ChakraType, number> = {} as Record<ChakraType, number>;
  
  Object.entries(chakraStates).forEach(([type, state]) => {
    const chakraType = type as ChakraType;
    // Normalize to 0-100 scale
    result[chakraType] = state.active ? 
      state.activationLevel * (1 - state.blockages / 10) : 0;
  });
  
  return result;
}
