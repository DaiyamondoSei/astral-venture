
import { ChakraType } from '@/types/chakra/ChakraSystemTypes';
import { ErrorSeverities } from '@/types/core/validation/constants';

/**
 * Get chakra intensity based on the activation level
 * This is a numeric representation of chakra activation intensity
 * 
 * @param chakraIndex The index of the chakra to check
 * @param activatedChakras Array of activated chakra indices
 * @returns A number representing the intensity (0-1 scale)
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

/**
 * Get chakra intensity level as a string description
 * 
 * @param chakraIndex The index of the chakra to check
 * @param activatedChakras Array of activated chakra indices
 * @returns A string representing the intensity level ('low', 'medium', or 'high')
 */
export function getChakraIntensityLevel(chakraIndex: number, activatedChakras: number[]): string {
  const intensity = getChakraIntensity(chakraIndex, activatedChakras);
  
  if (intensity >= 0.8) {
    return ErrorSeverities.ERROR; // 'high'
  } else if (intensity >= 0.4) {
    return ErrorSeverities.WARNING; // 'medium'
  } else {
    return ErrorSeverities.INFO; // 'low'
  }
}
