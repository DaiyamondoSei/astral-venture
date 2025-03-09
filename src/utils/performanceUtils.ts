
// Import required modules and types
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

/**
 * Performance category enumeration for device capability
 */
export enum DeviceCapability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Performance mode type (auto or explicit capability)
 */
export type PerformanceMode = DeviceCapability | 'auto';

/**
 * Render frequency classification
 */
export enum RenderFrequency {
  NORMAL = 'normal',
  FREQUENT = 'frequent',
  EXCESSIVE = 'excessive'
}

/**
 * Determine device performance category based on various factors
 */
export function getPerformanceCategory(): DeviceCapability {
  // Check if running in a browser environment
  if (typeof window === 'undefined') {
    return DeviceCapability.MEDIUM;
  }

  // Check for stored performance override
  const storedCategory = localStorage.getItem('performanceCategory');
  if (storedCategory === 'low' || storedCategory === 'medium' || storedCategory === 'high') {
    return storedCategory as DeviceCapability;
  }

  // Check for device memory API (Chrome)
  const memory = (navigator as any).deviceMemory || 4;
  
  // Check for mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Determine performance category based on device characteristics
  if (memory >= 8 && !isMobile) {
    return DeviceCapability.HIGH;
  } else if (memory <= 2 || isMobile) {
    return DeviceCapability.LOW;
  } else {
    return DeviceCapability.MEDIUM;
  }
}

/**
 * Generic throttle function
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
    }
    
    return lastResult;
  };
}

/**
 * Throttle function with performance-adaptive timing
 */
export function throttleForPerformance<T extends (...args: any[]) => any>(
  func: T,
  baseLimit: number = 100
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  const performanceCategory = getPerformanceCategory();
  const multiplier = 
    performanceCategory === DeviceCapability.LOW 
      ? 2 
      : performanceCategory === DeviceCapability.MEDIUM 
        ? 1.5 
        : 1;
  
  return throttle(func, baseLimit * multiplier);
}

/**
 * Monitor performance metrics
 */
export function monitorPerformance() {
  console.log('Starting performance monitoring');
  // Initialize performance monitoring
  performanceMonitor.startMonitoring();
}

/**
 * Get FPS estimation based on render timing
 */
export function estimateFPS(renderTime: number): number {
  if (renderTime <= 0) return 60;
  return Math.min(60, Math.floor(1000 / renderTime));
}

/**
 * Determine if a feature should be enabled based on performance
 */
export function shouldEnableFeature(
  feature: string, 
  minCategory: DeviceCapability = DeviceCapability.LOW
): boolean {
  const currentCategory = getPerformanceCategory();
  
  // Map categories to numeric values for comparison
  const categoryValues = {
    [DeviceCapability.LOW]: 1,
    [DeviceCapability.MEDIUM]: 2,
    [DeviceCapability.HIGH]: 3
  };
  
  return categoryValues[currentCategory] >= categoryValues[minCategory];
}
