
// Performance optimization utilities
/**
 * Detects if the device is a low-performance device
 * This is a simple heuristic based on CPU cores and device memory
 */
export const isLowPerformanceDevice = (): boolean => {
  // Check the number of logical processors (CPU cores)
  const cpuCores = navigator.hardwareConcurrency || 0;
  
  // Check device memory (in GB) if available
  const deviceMemory = (navigator as any).deviceMemory || 8;
  
  // Mobile device detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Consider it a low-performance device if:
  // - It has 2 or fewer CPU cores, or
  // - It has less than 4GB of RAM, or
  // - It's a mobile device with 4 or fewer cores
  return cpuCores <= 2 || deviceMemory < 4 || (isMobile && cpuCores <= 4);
};

/**
 * Determines animation quality level based on device capabilities and user preferences
 */
export const getAnimationQualityLevel = (): 'high' | 'medium' | 'low' => {
  // Check if user has enabled reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return 'low';
  }
  
  if (isLowPerformanceDevice()) {
    return 'medium';
  }
  
  return 'high';
};

/**
 * Creates a debounced version of a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Optimize animation frame rate based on device capabilities
 * For low-end devices, we'll skip frames to maintain performance
 */
export const createOptimizedAnimationFrame = () => {
  const quality = getAnimationQualityLevel();
  
  // Frame skipping rate based on quality level
  const frameSkip = quality === 'high' ? 0 : quality === 'medium' ? 1 : 2;
  let frameCount = 0;
  
  return (callback: FrameRequestCallback): number => {
    if (frameSkip === 0 || frameCount % (frameSkip + 1) === 0) {
      return requestAnimationFrame(callback);
    }
    
    frameCount++;
    return requestAnimationFrame(() => {
      frameCount++;
      // Skip this frame
    });
  };
};
