
/**
 * Utility functions to detect device capabilities and optimize performance
 */

type QualityLevel = 'low' | 'medium' | 'high';

/**
 * Determines the appropriate animation quality level based on device capabilities
 * This helps optimize performance across different devices
 */
export function getAnimationQualityLevel(): QualityLevel {
  // Check if we're running on the server
  if (typeof window === 'undefined') return 'medium';
  
  // Check if reduced motion is preferred
  if (typeof window.matchMedia === 'function') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return 'low';
  }
  
  // Use memory as a primary indicator if available
  if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory as number;
    if (memory && memory < 4) return 'low';
    if (memory && memory < 8) return 'medium';
    if (memory && memory >= 8) return 'high';
  }
  
  // Check for mobile devices which typically have lower performance
  const isMobile = typeof navigator !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
  if (isMobile) {
    // Further distinguish between low and mid-range mobile devices
    const isOlderDevice = 
      /Android [1-7]\./.test(navigator.userAgent) || 
      /iPhone OS ([1-9]|10|11)_/.test(navigator.userAgent);
      
    return isOlderDevice ? 'low' : 'medium';
  }
  
  // Check hardware concurrency (number of logical CPU cores)
  if (typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator) {
    const cores = navigator.hardwareConcurrency;
    if (cores <= 2) return 'low';
    if (cores <= 4) return 'medium';
    return 'high';
  }
  
  // Check if the device has a high refresh rate screen
  try {
    // @ts-ignore - Modern browsers support getScreenDetails API
    if (navigator.screen && navigator.screen.getScreenDetails) {
      // @ts-ignore
      const refreshRate = screen.refreshRate || 60;
      if (refreshRate >= 90) return 'high';
    }
  } catch (e) {
    // Ignore errors for browsers that don't support this API
  }
  
  // Fallback to medium quality if we can't determine device capabilities
  return 'medium';
}

/**
 * Throttles a function to limit how often it can execute
 * Useful for expensive operations like resize handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Detects if the browser supports certain features needed for optimal animations
 */
export function getDeviceCapabilities() {
  // Return default values when running on the server
  if (typeof window === 'undefined') {
    return {
      supportsWebGL: false,
      supportsRequestAnimationFrame: false,
      supportsPassiveEventListeners: false,
      pixelRatio: 1,
      isHighEndDevice: false,
      supportsIntersectionObserver: false,
      supportsTouchEvents: false,
      batteryLevel: null
    };
  }

  // Try to get battery info
  let batteryLevel = null;
  try {
    // @ts-ignore - Modern browsers support navigator.getBattery
    if (navigator.getBattery) {
      // We won't await this as it's just for optimization hints
      // @ts-ignore
      navigator.getBattery().then(battery => {
        batteryLevel = battery.level;
      });
    }
  } catch (e) {
    // Ignore errors for browsers that don't support this API
  }
  
  return {
    supportsWebGL: checkWebGLSupport(),
    supportsRequestAnimationFrame: typeof requestAnimationFrame !== 'undefined',
    supportsPassiveEventListeners: checkPassiveEventSupport(),
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    isHighEndDevice: getAnimationQualityLevel() === 'high',
    supportsIntersectionObserver: 'IntersectionObserver' in window,
    supportsTouchEvents: 'ontouchstart' in window,
    batteryLevel
  };
}

/**
 * Checks if WebGL is supported by the browser
 */
function checkWebGLSupport(): boolean {
  if (typeof document === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

/**
 * Checks if the browser supports passive event listeners
 */
function checkPassiveEventSupport(): boolean {
  let supportsPassive = false;
  
  try {
    // Test via a getter in the options object to see if the passive property is accessed
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
        return true;
      }
    });
    
    window.addEventListener('testPassive', null as any, opts);
    window.removeEventListener('testPassive', null as any, opts);
  } catch (e) {
    // Do nothing
  }
  
  return supportsPassive;
}

/**
 * Debounces a function to avoid excessive calls
 * Useful for operations tied to window resize or scroll events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = function() {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Calculates the optimal number of elements to render based on device performance
 * Useful for virtualizing large lists or complex components
 */
export function getOptimalElementCount(
  baseCount: number, 
  elementComplexity: 'low' | 'medium' | 'high' = 'medium'
): number {
  const qualityLevel = getAnimationQualityLevel();
  const { pixelRatio, isHighEndDevice } = getDeviceCapabilities();
  
  // Adjust based on quality level
  let multiplier = 1;
  
  switch (qualityLevel) {
    case 'low':
      multiplier = 0.5;
      break;
    case 'medium':
      multiplier = 0.8;
      break;
    case 'high':
      multiplier = 1;
      break;
  }
  
  // Consider element complexity
  switch (elementComplexity) {
    case 'low':
      multiplier *= 1.2;
      break;
    case 'high':
      multiplier *= 0.8;
      break;
  }
  
  // Adjust for high pixel ratio devices (retina displays)
  if (pixelRatio > 2 && !isHighEndDevice) {
    multiplier *= 0.8;
  }
  
  // Calculate and ensure a minimum number of elements
  return Math.max(Math.floor(baseCount * multiplier), 5);
}
