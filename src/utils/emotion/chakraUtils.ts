
/**
 * Utilities for working with chakras and emotional growth
 */

/**
 * Add chakras based on reflection count
 */
export function addReflectionBasedChakras(
  reflectionCount: number,
  existingChakras: number[]
): number[] {
  const chakras = [...existingChakras];
  
  // Add reflection-count based chakras as a fallback
  if (reflectionCount >= 1 && !chakras.includes(5)) chakras.push(5); // Root
  if (reflectionCount >= 3 && !chakras.includes(4)) chakras.push(4); // Sacral
  if (reflectionCount >= 5 && !chakras.includes(3)) chakras.push(3); // Solar
  if (reflectionCount >= 7 && !chakras.includes(2)) chakras.push(2); // Heart
  if (reflectionCount >= 9 && !chakras.includes(1)) chakras.push(1); // Throat
  if (reflectionCount >= 12 && !chakras.includes(0)) chakras.push(0); // Crown
  
  return chakras;
}

/**
 * Calculate emotional growth based on reflection count
 */
export function calculateEmotionalGrowth(reflectionCount: number): number {
  // Calculate emotional growth (0-100)
  return Math.min(reflectionCount * 10, 100);
}
