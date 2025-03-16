
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
 * Gets the intensity for a specific chakra activation
 * @param chakraIndex The index of the chakra
 * @param activatedChakras Array of activated chakra indices
 */
export const getChakraIntensity = (chakraIndex: number, activatedChakras: number[] = []): number => {
  const normalizedChakras = normalizeChakraData(activatedChakras);
  return normalizedChakras.includes(chakraIndex) ? 1.0 : 0.3;
};

/**
 * Gets the resonance or connection strength between chakras
 * @param chakra1 First chakra index
 * @param chakra2 Second chakra index
 * @param activatedChakras Activated chakra indices
 */
export const getChakraResonance = (chakra1: number, chakra2: number, activatedChakras: number[] = []): number => {
  const normalizedChakras = normalizeChakraData(activatedChakras);
  const bothActive = normalizedChakras.includes(chakra1) && normalizedChakras.includes(chakra2);
  
  if (bothActive) return 1.0;
  if (normalizedChakras.includes(chakra1) || normalizedChakras.includes(chakra2)) return 0.5;
  return 0.1;
};

/**
 * Adds reflection-based chakras to the existing activated chakras
 * @param existingChakras Currently activated chakra indices
 * @param reflectionContent Content of the reflection
 */
export const addReflectionBasedChakras = (existingChakras: number[] = [], reflectionContent: string = ""): number[] => {
  if (!reflectionContent) return existingChakras;
  
  const normalizedChakras = normalizeChakraData(existingChakras);
  const newChakras = new Set(normalizedChakras);
  
  // Simple keywords mapping for chakras
  const chakraKeywords = [
    ["security", "survival", "grounding", "stability", "foundation"],     // Root
    ["creativity", "passion", "emotion", "pleasure", "relationships"],    // Sacral
    ["confidence", "power", "will", "personal", "strength"],              // Solar Plexus
    ["love", "compassion", "healing", "harmony", "balance"],              // Heart
    ["communication", "expression", "truth", "voice", "clarity"],         // Throat
    ["intuition", "insight", "third eye", "vision", "awareness"],         // Third Eye
    ["spirituality", "connection", "divine", "consciousness", "unity"]    // Crown
  ];
  
  const lowerContent = reflectionContent.toLowerCase();
  
  chakraKeywords.forEach((keywords, chakraIndex) => {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      newChakras.add(chakraIndex);
    }
  });
  
  return Array.from(newChakras);
};

/**
 * Calculates emotional growth based on chakra activation patterns
 * @param chakrasBefore Previous chakra activation state
 * @param chakrasAfter New chakra activation state
 */
export const calculateEmotionalGrowth = (chakrasBefore: number[] = [], chakrasAfter: number[] = []): number => {
  const normalizedBefore = normalizeChakraData(chakrasBefore);
  const normalizedAfter = normalizeChakraData(chakrasAfter);
  
  // Calculate balance before and after
  const balanceBefore = calculateChakraBalance({ indices: normalizedBefore });
  const balanceAfter = calculateChakraBalance({ indices: normalizedAfter });
  
  // Count newly activated chakras
  const newlyActivated = normalizedAfter.filter(c => !normalizedBefore.includes(c)).length;
  
  // Calculate growth score
  const balanceImprovement = Math.max(0, balanceAfter - balanceBefore);
  const activationBonus = newlyActivated * 0.15;
  
  return Math.min(balanceImprovement + activationBonus, 1.0);
};

/**
 * Re-export other chakra utility functions to maintain API compatibility
 */
export { normalizeChakraData } from './chakraTypes';
