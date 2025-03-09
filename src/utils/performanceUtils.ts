
/**
 * Utility functions for performance-related operations
 */

/**
 * Determines the performance category of the current device
 * based on hardware capabilities and browser features.
 * 
 * @returns 'high' | 'medium' | 'low' - performance category
 */
export function getPerformanceCategory(): 'high' | 'medium' | 'low' {
  // Default to medium if we can't determine
  let category: 'high' | 'medium' | 'low' = 'medium';
  
  try {
    // Check for hardware concurrency (CPU cores)
    const cpuCores = navigator.hardwareConcurrency || 0;
    
    // Check for device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory || 0;
    
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check connection type if available
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
    
    const connectionType = connection ? connection.effectiveType : null;
    
    // Determine category based on capabilities
    if (cpuCores >= 8 && deviceMemory >= 8 && !isMobile) {
      category = 'high';
    } else if ((cpuCores <= 2 || deviceMemory <= 2) && 
               (isMobile || connectionType === '2g' || connectionType === 'slow-2g')) {
      category = 'low';
    } else {
      category = 'medium';
    }
    
    // Check if the user has requested reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Downgrade performance category for users who prefer reduced motion
      category = category === 'high' ? 'medium' : 'low';
    }
    
  } catch (error) {
    console.warn('Error determining performance category:', error);
    // Default to medium on error
    category = 'medium';
  }
  
  return category;
}

/**
 * Determines if the current device is capable of running advanced animations
 * 
 * @returns boolean - true if device can handle advanced animations
 */
export function canUseAdvancedAnimations(): boolean {
  const category = getPerformanceCategory();
  return category === 'high';
}

/**
 * Gets appropriate throttle values based on device performance
 * 
 * @returns object with throttle intervals for different operations
 */
export function getThrottleValues() {
  const category = getPerformanceCategory();
  
  switch (category) {
    case 'high':
      return {
        rendering: 0,  // No throttling for high-end devices
        events: 0,
        animations: 0,
        tracking: 500
      };
    case 'medium':
      return {
        rendering: 100,
        events: 150,
        animations: 16, // Roughly one animation frame
        tracking: 1000
      };
    case 'low':
      return {
        rendering: 300,
        events: 500,
        animations: 33, // 30fps
        tracking: 2000
      };
    default:
      return {
        rendering: 100,
        events: 150,
        animations: 16,
        tracking: 1000
      };
  }
}
