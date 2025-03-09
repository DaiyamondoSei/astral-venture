
/**
 * Performance utilities for monitoring and optimizing application performance
 */

export enum DeviceCapability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Throttle function to limit the frequency of function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T>;

  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);

      return lastResult;
    }
  };
}

/**
 * Monitor performance of the device and application
 */
export function monitorPerformance() {
  // Check for device capabilities
  const deviceCapability = detectDeviceCapability();
  
  // Monitor FPS
  const fps = getCurrentFPS();
  
  // Monitor memory usage if available
  const memoryUsage = getMemoryUsage();
  
  return {
    deviceCapability,
    fps,
    memoryUsage,
    timestamp: Date.now()
  };
}

/**
 * Detect device capability based on hardware and browser features
 */
function detectDeviceCapability(): DeviceCapability {
  // Simple detection based on navigator properties
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (
    userAgent.includes('mobile') || 
    (navigator as any).deviceMemory < 4 || 
    (navigator as any).hardwareConcurrency < 4
  ) {
    return DeviceCapability.LOW;
  }
  
  if (
    (navigator as any).deviceMemory >= 8 && 
    (navigator as any).hardwareConcurrency >= 8
  ) {
    return DeviceCapability.HIGH;
  }
  
  return DeviceCapability.MEDIUM;
}

/**
 * Get current FPS using requestAnimationFrame
 */
function getCurrentFPS(): number {
  // This is a placeholder as actual FPS measurement requires running code over time
  return 60; // Default to 60fps
}

/**
 * Get memory usage if available in the browser
 */
function getMemoryUsage(): { totalJSHeapSize?: number, usedJSHeapSize?: number } {
  if ((performance as any).memory) {
    return {
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize
    };
  }
  
  return {};
}
