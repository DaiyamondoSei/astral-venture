
/**
 * Functions for calculating resonance between chakras
 */

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
  
  // Apply sacred geometry-based resonance patterns
  // Vesica Piscis pattern (sacred geometry intersection) increases resonance
  if (Math.abs(chakraIndex1 - chakraIndex2) === 2) {
    const vesicaPhase = Math.sin(Date.now() / 4000);
    resonance += 0.1 * (0.5 + vesicaPhase * 0.5);
  }
  
  // Phi-spiral intensification - creates a spiral of energy through the chakra system
  if ((chakraIndex1 + chakraIndex2) % 3 === 0) {
    const phi = 1.618033988749895;
    const phiFactor = Math.sin(Date.now() / (1000 * Math.pow(phi, (chakraIndex1 + chakraIndex2) % 4)));
    resonance += 0.08 * (0.5 + phiFactor * 0.5);
  }
  
  // Prime number harmonics - prime numbers have special properties in energy systems
  const primes = [2, 3, 5, 7, 11, 13];
  if (primes.includes(chakraIndex1 + chakraIndex2)) {
    resonance += 0.07 * (1 + Math.sin(Date.now() / 3000) * 0.3);
  }
  
  return Math.min(Math.max(resonance, 0.1), 1.0);
};
