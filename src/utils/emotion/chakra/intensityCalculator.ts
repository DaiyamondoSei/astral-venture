
/**
 * Functions for calculating chakra intensity
 */

import { calculateVariance } from './helpers';

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
  
  // Add slight variation for more organic feeling
  // This creates a subtle uniqueness each time intensity is calculated
  intensity += (Math.sin(Date.now() / 1000 + chakraIndex * 1000) * 0.05);
  
  // Add golden ratio influence for harmonic oscillation
  intensity += (Math.sin(Date.now() / 1618 + chakraIndex * 618) * 0.03);
  
  // Create harmonic relationships between chakras based on sacred geometry principles
  const harmonicFactor = 1 + (Math.sin(Date.now() / 2000) * 0.1);
  if ((chakraIndex === 0 && activatedChakras.includes(6)) || 
      (chakraIndex === 6 && activatedChakras.includes(0))) {
    // Root-Crown connection (special harmonic)
    intensity += 0.1 * harmonicFactor;
  }
  
  if ((chakraIndex === 1 && activatedChakras.includes(5)) || 
      (chakraIndex === 5 && activatedChakras.includes(1))) {
    // Sacral-Third Eye connection (creative insight)
    intensity += 0.08 * harmonicFactor;
  }
  
  // Apply Fibonacci-based natural rhythms to create organic pulsing
  const fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
  const fiboIndex = chakraIndex % fibonacci.length;
  const fiboFactor = fibonacci[fiboIndex] / 89; // Normalize to 0-1 range
  intensity += Math.sin(Date.now() / (1000 + fibonacci[fiboIndex] * 100)) * 0.05 * fiboFactor;
  
  // Apply phi (golden ratio) based modulation for more natural feeling
  const phi = 1.618033988749895;
  const phiPulse = Math.sin(Date.now() / (1000 * Math.pow(phi, chakraIndex % 3 + 1))) * 0.04;
  intensity += phiPulse;
  
  // More harmonious connection with chakras that create energy circuits
  // These connections reflect traditional energy pathways in subtle body systems
  if (activatedChakras.includes((chakraIndex + 2) % 7) && activatedChakras.includes((chakraIndex + 4) % 7)) {
    // Triangular energy circuit (every 3rd chakra)
    intensity += 0.07 * (1 + Math.sin(Date.now() / 2500) * 0.3);
  }
  
  // Ensure intensity is between 0 and 1
  return Math.min(Math.max(intensity, 0.1), 1.0);
};
