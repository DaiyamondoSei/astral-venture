
/**
 * Performance utilities for optimizing application performance
 */

// Device capability categories
export enum DeviceCapability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Determines the performance category of the current device
 * Based on device memory, processor cores, and user agent
 * 
 * @param userAgent Optional user agent string (defaults to navigator.userAgent)
 * @param memory Optional memory amount in GB (defaults to navigator.deviceMemory if available)
 * @returns Performance category (low, medium, high)
 */
export function getPerformanceCategory(
  userAgent?: string, 
  memory?: number
): DeviceCapability {
  // Use provided values or get from browser
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const mem = memory || (typeof navigator !== 'undefined' && 'deviceMemory' in navigator ? 
    (navigator as any).deviceMemory : undefined);
  
  // Low-end device indicators
  const isLowEndDevice = 
    /android 4\./i.test(ua) || 
    /Mobile/i.test(ua) && mem && mem <= 2 ||
    /iPhone|iPad/i.test(ua) && !/iPhone 1[3-9]|iPad Pro/i.test(ua);
  
  // High-end device indicators
  const isHighEndDevice = 
    (/desktop|macintosh/i.test(ua) && (!mem || mem >= 8)) ||
    /iPhone 1[3-9]|iPad Pro/i.test(ua) ||
    /high-end/i.test(ua);
  
  // Determine category based on indicators
  if (isLowEndDevice) {
    return DeviceCapability.LOW;
  } else if (isHighEndDevice) {
    return DeviceCapability.HIGH;
  } else {
    return DeviceCapability.MEDIUM;
  }
}

/**
 * Utility to throttle function calls for performance
 * 
 * @param func The function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCall = 0;
  let lastResult: ReturnType<T>;
  
  return function(...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      lastCall = now;
      lastResult = func(...args);
      return lastResult;
    }
    
    return undefined;
  };
}

/**
 * Batches multiple calls into a single execution
 * Useful for reducing the number of renders or API calls
 * 
 * @param callback Function to execute with batched calls
 * @param delay Delay in milliseconds
 * @returns Function that can be called multiple times but will only execute once per delay period
 */
export function batch<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const batch: Parameters<T>[0][] = [];
  
  return function(...args: Parameters<T>): void {
    batch.push(args[0]);
    
    if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        callback(batch);
        batch.length = 0;
        timeoutId = null;
      }, delay);
    }
  };
}

/**
 * Monitors application performance and logs significant issues
 * Simple utility for runtime performance optimization
 */
export function monitorPerformance(): void {
  if (typeof window === 'undefined') return;
  
  // Monitor long tasks using PerformanceObserver
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.error('PerformanceObserver error:', e);
    }
  }
  
  // Monitor frame rate
  let lastTime = performance.now();
  let frames = 0;
  let fps = 0;
  
  function checkFrameRate() {
    frames++;
    const now = performance.now();
    const elapsed = now - lastTime;
    
    if (elapsed >= 1000) {
      fps = Math.round((frames * 1000) / elapsed);
      
      if (fps < 30) {
        console.warn(`Low frame rate detected: ${fps} FPS`);
      }
      
      frames = 0;
      lastTime = now;
    }
    
    requestAnimationFrame(checkFrameRate);
  }
  
  requestAnimationFrame(checkFrameRate);
}

/**
 * Calculate a complexity score for a component based on various factors
 * @param renderTime Average render time in milliseconds
 * @param deps Number of dependencies
 * @param childCount Number of child components
 * @param stateCount Number of state variables
 * @returns Complexity score from 0-100
 */
export function calculateComplexityScore(
  renderTime: number,
  deps: number = 0,
  childCount: number = 0,
  stateCount: number = 0
): number {
  // Normalize values
  const normalizedRenderTime = Math.min(renderTime / 20, 1);
  const normalizedDeps = Math.min(deps / 15, 1);
  const normalizedChildCount = Math.min(childCount / 10, 1);
  const normalizedStateCount = Math.min(stateCount / 8, 1);
  
  // Weight factors
  const weights = {
    renderTime: 0.4,
    deps: 0.3,
    childCount: 0.2,
    stateCount: 0.1
  };
  
  // Calculate score
  const score = 
    (normalizedRenderTime * weights.renderTime) +
    (normalizedDeps * weights.deps) +
    (normalizedChildCount * weights.childCount) +
    (normalizedStateCount * weights.stateCount);
  
  return Math.round(score * 100);
}
