
/**
 * Functions for calculating and working with chakra intensity
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
  
  // Ensure intensity is between 0 and 1
  return Math.min(Math.max(intensity, 0.1), 1.0);
};

/**
 * Calculate resonance between chakras to create flowing energy patterns
 * 
 * @param chakraIndex1 - First chakra index 
 * @param chakraIndex2 - Second chakra index
 * @param activatedChakras - Array of activated chakra indices
 * @returns Resonance value from 0-1
 */
export const getChakraResonance = (
  chakraIndex1: number,
  chakraIndex2: number,
  activatedChakras: number[]
): number => {
  // If either chakra is not activated, resonance is minimal
  if (!activatedChakras.includes(chakraIndex1) || !activatedChakras.includes(chakraIndex2)) {
    return 0.1;
  }
  
  // Base resonance - stronger between adjacent chakras
  const distance = Math.abs(chakraIndex1 - chakraIndex2);
  let resonance = 1 - (distance * 0.15);
  
  // Special resonance patterns
  // Crown and Root (0 and 6) have special connection in awakened systems
  if ((chakraIndex1 === 0 && chakraIndex2 === 6) || (chakraIndex1 === 6 && chakraIndex2 === 0)) {
    resonance += 0.2;
  }
  
  // Heart connects strongly with all other chakras
  if (chakraIndex1 === 3 || chakraIndex2 === 3) {
    resonance += 0.15;
  }
  
  // Throat and Third Eye have communication resonance
  if ((chakraIndex1 === 4 && chakraIndex2 === 5) || (chakraIndex1 === 5 && chakraIndex2 === 4)) {
    resonance += 0.2;
  }
  
  // Add organic variation using mathematical principles
  // Based on golden ratio (phi ≈ 1.618) for more harmonic fluctuations
  resonance += (Math.sin(Date.now() / 1618 + (chakraIndex1 + chakraIndex2) * 618) * 0.08);
  
  // Add fibonacci-based pattern for more complex, natural-feeling variation
  const fibonacciPulse = Math.sin(Date.now() / 2584) * Math.cos(Date.now() / 1597) * 0.05;
  resonance += fibonacciPulse;
  
  // Create sacral-throat-crown axis resonance for creativity-expression-consciousness flow
  if ((chakraIndex1 === 1 && chakraIndex2 === 4) || (chakraIndex1 === 4 && chakraIndex2 === 1) ||
      (chakraIndex1 === 4 && chakraIndex2 === 6) || (chakraIndex1 === 6 && chakraIndex2 === 4)) {
    resonance += 0.12 * (1 + Math.sin(Date.now() / 3000) * 0.2);
  }
  
  // Create root-solar-third eye axis for grounding intuition
  if ((chakraIndex1 === 0 && chakraIndex2 === 2) || (chakraIndex1 === 2 && chakraIndex2 === 0) ||
      (chakraIndex1 === 2 && chakraIndex2 === 5) || (chakraIndex1 === 5 && chakraIndex2 === 2)) {
    resonance += 0.1 * (1 + Math.cos(Date.now() / 3500) * 0.2);
  }
  
  return Math.min(Math.max(resonance, 0.1), 1.0);
};

/**
 * Calculate the overall balance of the chakra system
 * Higher values indicate more harmonious energy distribution
 * 
 * @param activatedChakras - Array of activated chakra indices
 * @param getIntensityFn - Function to get intensity for a specific chakra
 * @returns Balance score from 0-1
 */
export const calculateChakraBalance = (
  activatedChakras: number[],
  getIntensityFn: (chakraIndex: number) => number
): number => {
  // If no chakras are activated, return 0
  if (activatedChakras.length === 0) return 0;
  
  // If only one chakra is activated, return a medium balance
  if (activatedChakras.length === 1) return 0.5;
  
  // Calculate intensities for all chakras
  const allIntensities = [0, 1, 2, 3, 4, 5, 6].map(index => 
    getIntensityFn(index)
  );
  
  // Calculate variance of intensities (lower variance = more balanced)
  const intensityVariance = calculateVariance(allIntensities);
  
  // Check distribution pattern (more balanced when chakras are distributed evenly)
  const activationGaps = activatedChakras
    .sort((a, b) => a - b)
    .map((val, i, arr) => i > 0 ? val - arr[i-1] : val);
  
  const gapVariance = calculateVariance(activationGaps);
  
  // Calculate balance score - inverse of variances (lower variance = higher balance)
  const balanceScore = 1 - ((intensityVariance + gapVariance) / 2);
  
  return Math.min(Math.max(balanceScore, 0), 1);
};
