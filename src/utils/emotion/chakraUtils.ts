
/**
 * Utilities for working with chakras and emotional growth
 * This file provides unified chakra utility functions
 */

import { ChakraActivated, normalizeChakraData } from './chakraTypes';

// Memoized chakra names for faster lookups
const CHAKRA_NAMES = [
  "Root", "Sacral", "Solar Plexus", "Heart", 
  "Throat", "Third Eye", "Crown"
];

// Memoized chakra colors for faster lookups
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
 * Efficiently gets chakra names based on indices
 */
export const getChakraNames = (chakraIndices: number[]): string[] => {
  if (!chakraIndices || !chakraIndices.length) return [];
  
  return chakraIndices
    .filter(index => index >= 0 && index < CHAKRA_NAMES.length)
    .map(index => CHAKRA_NAMES[index]);
};

/**
 * Efficiently gets chakra colors based on indices
 */
export const getChakraColors = (chakraIndices: number[]): string[] => {
  if (!chakraIndices || !chakraIndices.length) return [];
  
  return chakraIndices
    .filter(index => index >= 0 && index < CHAKRA_COLORS.length)
    .map(index => CHAKRA_COLORS[index]);
};

/**
 * Gets the color for a specific chakra by index
 */
export const getChakraColor = (chakraIndex: number): string => {
  if (chakraIndex >= 0 && chakraIndex < CHAKRA_COLORS.length) {
    return CHAKRA_COLORS[chakraIndex];
  }
  return "#FFFFFF"; // Default white for unknown
};

/**
 * Gets the name for a specific chakra by index
 */
export const getChakraName = (chakraIndex: number): string => {
  if (chakraIndex >= 0 && chakraIndex < CHAKRA_NAMES.length) {
    return CHAKRA_NAMES[chakraIndex];
  }
  return "Unknown";
};

/**
 * Calculates the chakra balance percentage with optimized performance
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
 * Re-export other chakra utility functions
 */
export { addReflectionBasedChakras } from './chakra/reflectionActivation';
export { calculateEmotionalGrowth } from './chakra/emotionalGrowth';
