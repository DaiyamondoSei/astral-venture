
/**
 * Utility functions for performance optimization
 */

// Device capability categories
export type DeviceCapability = 'low' | 'medium' | 'high';

/**
 * Detects device capabilities based on navigator and hardware concurrency
 */
export function detectDeviceCapabilities(): DeviceCapability {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'medium'; // Default for SSR
  }

  // Check if it's a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Check memory and CPU capabilities
  const memoryLimit = (navigator as any).deviceMemory || 4; // Default to 4GB if not available
  const cpuCores = navigator.hardwareConcurrency || 4; // Default to 4 cores if not available

  if (isMobile && (memoryLimit <= 2 || cpuCores <= 4)) {
    return 'low';
  } else if ((isMobile && memoryLimit >= 4) || (!isMobile && cpuCores >= 4)) {
    return 'medium';
  } else {
    return 'high';
  }
}

/**
 * Evaluates and returns device performance category
 */
export function getPerformanceCategory(): DeviceCapability {
  // Cache the result to avoid recalculating
  if (typeof window !== 'undefined' && !(window as any).__deviceCapability) {
    (window as any).__deviceCapability = detectDeviceCapabilities();
  }
  
  return typeof window !== 'undefined' 
    ? (window as any).__deviceCapability || 'medium' 
    : 'medium';
}

/**
 * Calculates optimal element count based on device capabilities
 * @param baseCount Base count for medium devices
 * @param category Device capability category (optional)
 * @returns Adjusted count based on device capability
 */
export function getOptimalElementCount(
  baseCount: number,
  category?: DeviceCapability
): number {
  const deviceCategory = category || getPerformanceCategory();
  
  switch (deviceCategory) {
    case 'low':
      return Math.max(1, Math.ceil(baseCount * 0.5));
    case 'high':
      return Math.ceil(baseCount * 1.5);
    case 'medium':
    default:
      return baseCount;
  }
}

/**
 * Adjusts animation complexity based on device capabilities
 * @param baseComplexity The standard complexity value for animations
 * @returns Adjusted complexity value
 */
export function getOptimalAnimationComplexity(baseComplexity: number): number {
  const deviceCategory = getPerformanceCategory();
  
  switch (deviceCategory) {
    case 'low':
      return Math.max(1, Math.ceil(baseComplexity * 0.4));
    case 'high':
      return Math.ceil(baseComplexity * 1.2);
    case 'medium':
    default:
      return baseComplexity;
  }
}
