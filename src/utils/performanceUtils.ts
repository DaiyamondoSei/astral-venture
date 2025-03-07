
/**
 * Utility to detect device performance capabilities
 * Returns a score from 0 (lowest) to 10 (highest)
 */
export const detectDeviceCapabilities = (): number => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return 5; // Default to medium for SSR
  
  // Start with base score
  let score = 5;
  
  // Check navigator properties if available
  if (navigator.deviceMemory) {
    // Device memory in GB
    score += Math.min(navigator.deviceMemory, 8) / 2;
  }
  
  // Check for hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency) {
    score += Math.min(navigator.hardwareConcurrency, 8) / 2;
  }
  
  // Check if it's a mobile device (generally lower performance)
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    score -= 2;
  }
  
  // Clamp the score between.0 and 10
  return Math.max(0, Math.min(10, score));
};

/**
 * Performance categories
 */
export type PerformanceCategory = 'low' | 'medium' | 'high';

/**
 * Maps device capabilities to performance categories
 */
export const getPerformanceCategory = (): PerformanceCategory => {
  const score = detectDeviceCapabilities();
  
  if (score < 3) return 'low';
  if (score < 7) return 'medium';
  return 'high';
};

/**
 * Adjusts element count based on device capabilities
 * 
 * @param baseCount - The base number of elements to display
 * @param category - Optional manual performance category override
 * @returns Optimized count of elements to display
 */
export const getOptimalElementCount = (
  baseCount: number,
  category?: PerformanceCategory
): number => {
  const performanceCategory = category || getPerformanceCategory();
  
  switch (performanceCategory) {
    case 'low':
      return Math.ceil(baseCount * 0.5); // 50% of base count
    case 'medium':
      return baseCount; // 100% of base count
    case 'high':
      return Math.ceil(baseCount * 1.5); // 150% of base count
    default:
      return baseCount;
  }
};

/**
 * Returns optimal animation fps based on device capabilities
 */
export const getOptimalAnimationFPS = (): number => {
  const performanceCategory = getPerformanceCategory();
  
  switch (performanceCategory) {
    case 'low':
      return 30;
    case 'medium':
      return 45;
    case 'high':
      return 60;
    default:
      return 45;
  }
};

/**
 * Helper to throttle animations based on device capabilities
 * 
 * @param callback - The animation callback
 * @param fps - Optional FPS override
 * @returns Throttled animation function and a cleanup function
 */
export const createThrottledAnimation = (
  callback: (time: number) => void,
  fps?: number
): { start: () => void; stop: () => void } => {
  const targetFPS = fps || getOptimalAnimationFPS();
  const frameInterval = 1000 / targetFPS;
  
  let lastFrameTime = 0;
  let animationFrameId: number | null = null;
  
  const animate = (time: number) => {
    animationFrameId = requestAnimationFrame(animate);
    
    const elapsed = time - lastFrameTime;
    
    if (elapsed > frameInterval) {
      lastFrameTime = time - (elapsed % frameInterval);
      callback(time);
    }
  };
  
  return {
    start: () => {
      if (!animationFrameId) {
        lastFrameTime = performance.now();
        animationFrameId = requestAnimationFrame(animate);
      }
    },
    stop: () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }
  };
};
