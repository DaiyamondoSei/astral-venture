
/**
 * Utility for adding reflection-based chakra activations
 */

/**
 * Adds chakras based on reflection count to existing activated chakras
 * More reflections lead to more activated chakras (with diminishing returns)
 */
export function addReflectionBasedChakras(
  reflectionCount: number,
  existingChakras: number[] = []
): number[] {
  // Clone the existing chakras array to avoid modifying the original
  const chakras = [...existingChakras];
  
  // Determine how many chakras should be activated based on reflection count
  // Using a logarithmic scale to give diminishing returns
  let chakrasToActivate = 0;
  
  if (reflectionCount >= 1) chakrasToActivate = 1;  // First reflection activates 1 chakra
  if (reflectionCount >= 3) chakrasToActivate = 2;  // 3+ reflections activate 2 chakras
  if (reflectionCount >= 7) chakrasToActivate = 3;  // 7+ reflections activate 3 chakras
  if (reflectionCount >= 12) chakrasToActivate = 4; // 12+ reflections activate 4 chakras
  if (reflectionCount >= 18) chakrasToActivate = 5; // 18+ reflections activate 5 chakras
  if (reflectionCount >= 25) chakrasToActivate = 6; // 25+ reflections activate 6 chakras
  if (reflectionCount >= 35) chakrasToActivate = 7; // 35+ reflections activate all 7 chakras
  
  // If we already have more chakras activated than the reflection count would suggest,
  // don't deactivate any
  if (chakras.length >= chakrasToActivate) {
    return chakras;
  }
  
  // Activate chakras in a specific order (heart first, then expanding outward)
  const activationOrder = [3, 4, 2, 5, 1, 6, 0];
  
  // Add chakras until we reach the target number
  for (const chakraIndex of activationOrder) {
    if (!chakras.includes(chakraIndex)) {
      chakras.push(chakraIndex);
      
      // Stop when we've added enough chakras
      if (chakras.length >= chakrasToActivate) {
        break;
      }
    }
  }
  
  return chakras;
}
