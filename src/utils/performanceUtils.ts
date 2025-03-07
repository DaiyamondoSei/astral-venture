
/**
 * Detect the performance category based on device capabilities
 * @returns 'low', 'medium', or 'high'
 */
export function getPerformanceCategory(): 'low' | 'medium' | 'high' {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return 'medium';
    
    // Check for navigator.deviceMemory (only available in some browsers)
    const memory = (navigator as any).deviceMemory || 4;
    
    // Check for hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;
    
    // Low-end devices
    if (memory <= 2 || cores <= 2) {
      return 'low';
    }
    
    // High-end devices
    if (memory >= 8 && cores >= 6) {
      return 'high';
    }
    
    // Medium devices (default)
    return 'medium';
  } catch (error) {
    console.warn('Error determining performance category:', error);
    return 'medium'; // Fallback to medium
  }
}

/**
 * Calculate optimal element count based on device performance
 * @param baseCount The baseline count for medium devices
 * @param category Optional performance category override
 * @returns Adjusted count for the current device
 */
export function getOptimalElementCount(
  baseCount: number,
  category?: 'low' | 'medium' | 'high'
): number {
  const performanceCategory = category || getPerformanceCategory();
  
  switch (performanceCategory) {
    case 'low':
      return Math.max(1, Math.floor(baseCount * 0.5));
    case 'medium':
      return baseCount;
    case 'high':
      return Math.ceil(baseCount * 1.5);
    default:
      return baseCount;
  }
}
