
/**
 * Utilities for working with chakras and emotional growth
 * This file re-exports functionality from more focused chakra utility files
 */

export { addReflectionBasedChakras } from './chakra/reflectionActivation';
export { calculateEmotionalGrowth } from './chakra/emotionalGrowth';

/**
 * Converts chakra numbers to chakra names
 */
export const getChakraNames = (chakraIndices: number[]): string[] => {
  const chakraNames = [
    "Root", "Sacral", "Solar Plexus", "Heart", 
    "Throat", "Third Eye", "Crown"
  ];
  
  return chakraIndices.map(index => {
    if (index >= 0 && index < chakraNames.length) {
      return chakraNames[index];
    }
    return "Unknown";
  });
};

/**
 * Gets chakra colors based on chakra indices
 */
export const getChakraColors = (chakraIndices: number[]): string[] => {
  const chakraColors = [
    "#FF0000", // Root - Red
    "#FF8000", // Sacral - Orange
    "#FFFF00", // Solar Plexus - Yellow
    "#00FF00", // Heart - Green
    "#00FFFF", // Throat - Light Blue
    "#0000FF", // Third Eye - Indigo
    "#8000FF"  // Crown - Violet
  ];
  
  return chakraIndices.map(index => {
    if (index >= 0 && index < chakraColors.length) {
      return chakraColors[index];
    }
    return "#FFFFFF"; // Default white for unknown
  });
};

/**
 * Calculates the chakra balance percentage
 */
export const calculateChakraBalance = (activatedChakras: number[]): number => {
  if (activatedChakras.length === 0) return 0;
  
  // Calculate balance by looking at distribution across all chakra levels
  const lowerChakras = activatedChakras.filter(i => i < 3).length;
  const middleChakras = activatedChakras.filter(i => i >= 3 && i < 5).length;
  const higherChakras = activatedChakras.filter(i => i >= 5).length;
  
  // Perfect balance would have representation in all three ranges
  let balance = 0;
  
  if (lowerChakras > 0) balance += 0.33;
  if (middleChakras > 0) balance += 0.33;
  if (higherChakras > 0) balance += 0.33;
  
  // Add bonus for having multiple chakras active
  const totalBonus = Math.min(0.01 * activatedChakras.length, 0.1);
  
  return Math.min(balance + totalBonus, 1.0);
};
