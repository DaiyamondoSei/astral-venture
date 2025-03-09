
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

// Cache for performance category to avoid recalculating
let cachedPerformanceCategory: DeviceCapability | null = null;
let categoryCacheTime = 0;
const CACHE_TTL = 60000; // 1 minute cache time

/**
 * Determine device performance category based on various factors
 * Optimized with caching to avoid frequent recalculation
 */
export function getPerformanceCategory(): DeviceCapability {
  const now = Date.now();
  
  // Return cached value if still valid
  if (cachedPerformanceCategory && (now - categoryCacheTime < CACHE_TTL)) {
    return cachedPerformanceCategory;
  }
  
  // Check if running in a browser environment
  if (typeof window === 'undefined') {
    return DeviceCapability.MEDIUM;
  }

  // Check for stored performance override
  const storedCategory = localStorage.getItem('performanceCategory');
  if (storedCategory === 'low' || storedCategory === 'medium' || storedCategory === 'high') {
    cachedPerformanceCategory = storedCategory as DeviceCapability;
    categoryCacheTime = now;
    return cachedPerformanceCategory;
  }

  // Check for device memory API (Chrome)
  const memory = (navigator as any).deviceMemory || 4;
  
  // Check for mobile device - using a more efficient regex pattern
  const isMobile = /Android|iPhone|iPad|iPod|IEMobile/i.test(navigator.userAgent);
  
  // Determine performance category based on device characteristics
  if (memory >= 8 && !isMobile) {
    cachedPerformanceCategory = DeviceCapability.HIGH;
  } else if (memory <= 2 || isMobile) {
    cachedPerformanceCategory = DeviceCapability.LOW;
  } else {
    cachedPerformanceCategory = DeviceCapability.MEDIUM;
  }
  
  // Cache the calculation time
  categoryCacheTime = now;
  return cachedPerformanceCategory;
}

// Cache for throttled functions to avoid recreating them
const throttledFunctionsCache = new Map<string, {
  func: Function,
  limit: number,
  throttledFunc: Function
}>();

/**
 * Generic throttle function with function caching for better performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  // Generate a unique key for the function
  const funcKey = func.toString() + limit;
  
  // Check if we have a cached version
  const cached = throttledFunctionsCache.get(funcKey);
  if (cached && cached.limit === limit) {
    return cached.throttledFunc as (...args: Parameters<T>) => ReturnType<T> | undefined;
  }
  
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T>;
  
  const throttledFunc = function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  };
  
  // Cache the throttled function
  throttledFunctionsCache.set(funcKey, {
    func,
    limit,
    throttledFunc
  });
  
  return throttledFunc;
}

/**
 * Throttle function with performance-adaptive timing
 * Optimized to avoid redundant calculations
 */
export function throttleForPerformance<T extends (...args: any[]) => any>(
  func: T,
  baseLimit: number = 100
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  const performanceCategory = getPerformanceCategory();
  
  // Use a switch for better performance than multiple ternary operators
  let multiplier;
  switch (performanceCategory) {
    case DeviceCapability.LOW:
      multiplier = 2;
      break;
    case DeviceCapability.MEDIUM:
      multiplier = 1.5;
      break;
    default:
      multiplier = 1;
  }
  
  return throttle(func, Math.floor(baseLimit * multiplier));
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
 * Optimized to avoid division by zero and unnecessary calculations
 */
export function estimateFPS(renderTime: number): number {
  if (renderTime <= 0) return 60;
  // Avoid using Math.min for simple comparison
  const fps = Math.floor(1000 / renderTime);
  return fps > 60 ? 60 : fps;
}

// Cache for feature enablement decisions
const featureEnablementCache = new Map<string, {
  result: boolean,
  timestamp: number
}>();

/**
 * Determine if a feature should be enabled based on performance
 * Optimized with caching to improve performance
 */
export function shouldEnableFeature(
  feature: string, 
  minCategory: DeviceCapability = DeviceCapability.LOW
): boolean {
  // Check cache first
  const cacheKey = `${feature}:${minCategory}`;
  const cached = featureEnablementCache.get(cacheKey);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.result;
  }
  
  const currentCategory = getPerformanceCategory();
  
  // Map categories to numeric values for comparison
  const categoryValues = {
    [DeviceCapability.LOW]: 1,
    [DeviceCapability.MEDIUM]: 2,
    [DeviceCapability.HIGH]: 3
  };
  
  const result = categoryValues[currentCategory] >= categoryValues[minCategory];
  
  // Cache the result
  featureEnablementCache.set(cacheKey, {
    result,
    timestamp: now
  });
  
  return result;
}
