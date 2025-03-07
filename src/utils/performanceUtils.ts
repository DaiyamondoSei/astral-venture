
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
  if (typeof navigator !== 'undefined') {
    // Safely check for deviceMemory using optional chaining
    if ('deviceMemory' in navigator) {
      // @ts-ignore - deviceMemory is not in all TypeScript Navigator types
      const memory = navigator.deviceMemory as number || 4;
      score += Math.min(memory, 8) / 2;
    }
    
    // Check for hardware concurrency (CPU cores)
    if (navigator.hardwareConcurrency) {
      score += Math.min(navigator.hardwareConcurrency, 8) / 2;
    }
    
    // Check if it's a mobile device (generally lower performance)
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      score -= 2;
    }
  }
  
  // Clamp the score between 0 and 10
  return Math.max(0, Math.min(10, score));
};

/**
 * Performance categories
 */
export type PerformanceCategory = 'low' | 'medium' | 'high';

/**
 * Device capabilities information
 */
export interface DeviceCapabilities {
  score: number;
  category: PerformanceCategory;
  pixelRatio: number;
  isMobile: boolean;
  cpuCores: number;
}

/**
 * Get detailed device capabilities
 */
export const getDeviceCapabilities = (): DeviceCapabilities => {
  const score = detectDeviceCapabilities();
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const isMobile = typeof navigator !== 'undefined' 
    ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    : false;
  const cpuCores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 2 : 2;
  
  return {
    score,
    category: getPerformanceCategory(score),
    pixelRatio,
    isMobile,
    cpuCores
  };
};

/**
 * Maps device capabilities to performance categories
 */
export const getPerformanceCategory = (score?: number): PerformanceCategory => {
  const performanceScore = score !== undefined ? score : detectDeviceCapabilities();
  
  if (performanceScore < 3) return 'low';
  if (performanceScore < 7) return 'medium';
  return 'high';
};

/**
 * Get animation quality level based on device capabilities
 */
export const getAnimationQualityLevel = (): PerformanceCategory => {
  return getPerformanceCategory();
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
