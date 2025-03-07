
/**
 * Performance detection and management utilities
 */

/**
 * Performance categories for adapting UI complexity
 */
export type PerformanceCategory = 'low' | 'medium' | 'high';

/**
 * Get device performance category based on device capabilities
 * @returns PerformanceCategory - low, medium, or high
 */
export const getPerformanceCategory = (): PerformanceCategory => {
  if (typeof window === 'undefined') {
    return 'medium'; // Default for SSR
  }
  
  try {
    // Check for navigator.deviceMemory (returns RAM in GB)
    const deviceMemory = (navigator as any).deviceMemory || 4;
    
    // Check for hardware concurrency (CPU cores)
    const cpuCores = navigator.hardwareConcurrency || 4;
    
    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    // Device pixel ratio (higher on high-end devices)
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Check if the device is an iOS device with low memory
    const isLowPowerIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) && deviceMemory <= 2;
    
    // Check if reducedMotion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Calculate a rough performance score
    let performanceScore = 0;
    
    // Memory score (0-10)
    performanceScore += Math.min(deviceMemory * 2.5, 10);
    
    // CPU score (0-10)
    performanceScore += Math.min(cpuCores / 2, 10);
    
    // Mobile penalty
    if (isMobile) performanceScore -= 5;
    
    // Low power iOS penalty
    if (isLowPowerIOS) performanceScore -= 5;
    
    // High DPI bonus (or penalty if very high on mobile)
    if (pixelRatio > 1 && !isMobile) {
      performanceScore += 2;
    } else if (pixelRatio > 2 && isMobile) {
      // High DPI on mobile actually requires more processing power
      performanceScore -= 2;
    }
    
    // Reduced motion preference is a strong signal
    if (prefersReducedMotion) {
      performanceScore -= 8;
    }
    
    // Additional check: calculate a simple FPS benchmark
    try {
      let frameCount = 0;
      const startTime = performance.now();
      const checkFPS = () => {
        frameCount++;
        if (performance.now() - startTime < 500) {
          requestAnimationFrame(checkFPS);
        } else {
          // Calculate FPS (multiply by 2 since we only measured 500ms)
          const fps = frameCount * 2;
          
          // Adjust score based on FPS
          if (fps < 30) performanceScore -= 5;
          else if (fps > 55) performanceScore += 5;
        }
      };
      
      // Start FPS check
      requestAnimationFrame(checkFPS);
    } catch (e) {
      // Failed to check FPS, don't adjust score
      console.warn('Failed to check FPS:', e);
    }
    
    // Convert score to category
    if (performanceScore < 10) return 'low';
    if (performanceScore < 18) return 'medium';
    return 'high';
  } catch (error) {
    console.warn('Error determining device performance:', error);
    return 'medium'; // Default fallback
  }
};

/**
 * Adjusts animation settings based on device performance
 * @param lowQuality Settings for low-performance devices
 * @param mediumQuality Settings for medium-performance devices
 * @param highQuality Settings for high-performance devices
 * @returns Appropriate settings based on detected performance
 */
export function getPerformanceAdjustedSettings<T>(
  lowQuality: T,
  mediumQuality: T,
  highQuality: T
): T {
  const performanceCategory = getPerformanceCategory();
  
  switch (performanceCategory) {
    case 'low':
      return lowQuality;
    case 'medium':
      return mediumQuality;
    case 'high':
      return highQuality;
    default:
      return mediumQuality;
  }
}

/**
 * Adjusts particle count based on device performance
 * @param baseCount Desired particle count
 * @returns Adjusted particle count
 */
export const getAdjustedParticleCount = (baseCount: number): number => {
  const performanceCategory = getPerformanceCategory();
  
  switch (performanceCategory) {
    case 'low':
      return Math.max(5, Math.floor(baseCount * 0.3));
    case 'medium':
      return Math.floor(baseCount * 0.7);
    case 'high':
      return baseCount;
    default:
      return Math.floor(baseCount * 0.7);
  }
};

export default {
  getPerformanceCategory,
  getPerformanceAdjustedSettings,
  getAdjustedParticleCount
};
