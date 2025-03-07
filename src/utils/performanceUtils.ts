
/**
 * Utility functions to detect device capabilities and optimize performance
 */

type QualityLevel = 'low' | 'medium' | 'high';

/**
 * Determines the appropriate animation quality level based on device capabilities
 * This helps optimize performance across different devices
 */
export function getAnimationQualityLevel(): QualityLevel {
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
    return 'low';
  }
  
  // Check hardware concurrency (number of logical CPU cores)
  if (typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator) {
    const cores = navigator.hardwareConcurrency;
    if (cores <= 2) return 'low';
    if (cores <= 4) return 'medium';
    return 'high';
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
  return {
    supportsWebGL: checkWebGLSupport(),
    supportsRequestAnimationFrame: typeof requestAnimationFrame !== 'undefined',
    supportsPassiveEventListeners: checkPassiveEventSupport(),
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
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
