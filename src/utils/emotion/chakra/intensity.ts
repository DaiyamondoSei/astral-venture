
/**
 * Functions for calculating and working with chakra intensity
 */

/**
 * Get intensity level for a specific chakra
 * 
 * @param chakraIndex - Index of the chakra to check
 * @param activatedChakras - Array of activated chakra indices
 * @returns Intensity value from 0-1, or 0 if not activated
 */
export const getChakraIntensity = (
  chakraIndex: number,
  activatedChakras: number[]
): number => {
  // If chakra is not activated, return minimal intensity
  if (!activatedChakras.includes(chakraIndex)) {
    return 0.1;
  }
  
  // Calculate a basic intensity based on activation patterns
  // In a real app, this would be calculated from user data
  let intensity = 0.5;
  
  // Heart chakra (chakra 3) often gets higher intensity
  if (chakraIndex === 3) {
    intensity += 0.2;
  }
  
  // More activation when adjacent chakras are also active
  if (activatedChakras.includes(chakraIndex - 1) || activatedChakras.includes(chakraIndex + 1)) {
    intensity += 0.15;
  }
  
  // Additional calculation - more chakras = more overall energy
  intensity += Math.min(activatedChakras.length * 0.05, 0.25);
  
  // Ensure intensity is between 0 and 1
  return Math.min(Math.max(intensity, 0.1), 1.0);
};
