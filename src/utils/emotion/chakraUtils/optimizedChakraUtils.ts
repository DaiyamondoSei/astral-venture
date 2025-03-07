
import { ChakraActivated, normalizeChakraData } from '../chakraTypes';

/**
 * Memoized chakra names for faster lookups
 */
const CHAKRA_NAMES = [
  "Root", "Sacral", "Solar Plexus", "Heart", 
  "Throat", "Third Eye", "Crown"
];

/**
 * Memoized chakra colors for faster lookups
 */
const CHAKRA_COLORS = [
  "#FF0000", // Root - Red
  "#FF8000", // Sacral - Orange
  "#FFFF00", // Solar Plexus - Yellow
  "#00FF00", // Heart - Green
  "#00FFFF", // Throat - Light Blue
  "#0000FF", // Third Eye - Indigo
  "#8000FF"  // Crown - Violet
];

/**
 * Optimized function to get chakra names efficiently
 * @param chakraIndices Array of chakra indices
 * @returns Array of chakra names
 */
export const getChakraNames = (chakraIndices: number[]): string[] => {
  if (!chakraIndices || !chakraIndices.length) return [];
  
  return chakraIndices
    .filter(index => index >= 0 && index < CHAKRA_NAMES.length)
    .map(index => CHAKRA_NAMES[index]);
};

/**
 * Optimized function to get chakra colors efficiently
 * @param chakraIndices Array of chakra indices 
 * @returns Array of chakra color hex values
 */
export const getChakraColors = (chakraIndices: number[]): string[] => {
  if (!chakraIndices || !chakraIndices.length) return [];
  
  return chakraIndices
    .filter(index => index >= 0 && index < CHAKRA_COLORS.length)
    .map(index => CHAKRA_COLORS[index]);
};

/**
 * Enhanced chakra balance calculation with better performance
 * @param activatedChakras Array of activated chakra indices 
 * @returns Balance percentage (0-1)
 */
export const calculateChakraBalance = (chakras: ChakraActivated): number => {
  const activatedChakras = normalizeChakraData(chakras);
  
  if (!activatedChakras.length) return 0;
  
  // Pre-filter the arrays using Set operations for better performance
  const lowerChakrasSet = new Set([0, 1, 2]);
  const middleChakrasSet = new Set([3, 4]);
  const higherChakrasSet = new Set([5, 6]);
  
  // Use efficient Set operations
  const lowerChakras = activatedChakras.filter(i => lowerChakrasSet.has(i)).length;
  const middleChakras = activatedChakras.filter(i => middleChakrasSet.has(i)).length;
  const higherChakras = activatedChakras.filter(i => higherChakrasSet.has(i)).length;
  
  // Perfect balance would have representation in all three ranges
  let balance = 0;
  
  if (lowerChakras > 0) balance += 0.33;
  if (middleChakras > 0) balance += 0.33;
  if (higherChakras > 0) balance += 0.33;
  
  // Add bonus for having multiple chakras active
  const totalBonus = Math.min(0.01 * activatedChakras.length, 0.1);
  
  return Math.min(balance + totalBonus, 1.0);
};

/**
 * Gets the color for a specific chakra by index
 * @param chakraIndex The index of the chakra
 * @returns The color for the chakra
 */
export const getChakraColor = (chakraIndex: number): string => {
  if (chakraIndex >= 0 && chakraIndex < CHAKRA_COLORS.length) {
    return CHAKRA_COLORS[chakraIndex];
  }
  return "#FFFFFF"; // Default white for unknown
};

/**
 * Gets the name for a specific chakra by index
 * @param chakraIndex The index of the chakra 
 * @returns The name of the chakra
 */
export const getChakraName = (chakraIndex: number): string => {
  if (chakraIndex >= 0 && chakraIndex < CHAKRA_NAMES.length) {
    return CHAKRA_NAMES[chakraIndex];
  }
  return "Unknown";
};
