
/**
 * Functions for calculating chakra system balance
 */

import { calculateVariance } from './helpers';

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
  
  // Fibonacci-influenced balance calculation
  // In nature, Fibonacci distributions are signs of optimal growth patterns
  const fibonacci = [1, 2, 3, 5, 8, 13];
  let fiboFactor = 0;
  
  activatedChakras.forEach((chakra, i) => {
    if (i > 0) {
      const gap = activatedChakras[i] - activatedChakras[i-1];
      // Check if the gap is close to a fibonacci number
      const closestFibo = fibonacci.reduce((prev, curr) => 
        Math.abs(curr - gap) < Math.abs(prev - gap) ? curr : prev
      );
      // The closer to a fibonacci number, the more balanced it is
      fiboFactor += 1 - Math.min(Math.abs(closestFibo - gap) / 3, 1);
    }
  });
  
  // Add fibonacci factor to balance (normalized by activated chakras)
  const fiboBonus = activatedChakras.length > 1 ? 
    fiboFactor / (activatedChakras.length - 1) * 0.15 : 0;
  
  // Apply golden ratio influence to balance calculation
  const phi = 1.618033988749895;
  const heightRatio = allIntensities[3] / (allIntensities[0] > 0.1 ? allIntensities[0] : 0.1);
  const phiVariance = Math.abs(heightRatio - phi) / phi;
  const phiBonus = Math.max(0, 0.1 - (phiVariance * 0.1));
  
  // Calculate balance score - inverse of variances with natural pattern bonuses
  const balanceScore = 1 - ((intensityVariance + gapVariance) / 2.5) + fiboBonus + phiBonus;
  
  return Math.min(Math.max(balanceScore, 0), 1);
};
