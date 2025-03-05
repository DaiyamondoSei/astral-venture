
/**
 * Helper functions for chakra analysis
 */

/**
 * Calculate variance for a set of values
 * Used for determining balance in chakra activation
 * 
 * @param values - Array of numeric values
 * @returns Variance value
 */
export const calculateVariance = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
};
