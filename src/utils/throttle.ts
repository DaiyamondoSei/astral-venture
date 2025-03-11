/**
 * Throttle function
 * 
 * Limits the rate at which a function can be called.
 * The function will be called at most once per specified interval.
 * 
 * @param func The function to throttle
 * @param limit The time limit in milliseconds
 * @returns A throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const now = Date.now();
    const remaining = limit - (now - lastCall);
    
    // Store the latest arguments
    lastArgs = args;
    
    // If enough time has elapsed, call the function immediately
    if (remaining <= 0) {
      lastCall = now;
      func.apply(this, args);
    } 
    // Otherwise, schedule to call with latest args when the delay expires
    else if (!timeoutId) {
      timeoutId = window.setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        // Use the most recent arguments
        if (lastArgs) {
          func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
  };
}

/**
 * Debounce function
 * 
 * Delays invoking a function until after a specified wait period has elapsed
 * since the last time the debounced function was invoked.
 * 
 * @param func The function to debounce
 * @param wait The wait time in milliseconds
 * @param immediate Whether to invoke the function immediately
 * @returns A debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const callNow = immediate && !timeoutId;
    
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    
    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      if (!immediate) {
        func.apply(this, args);
      }
    }, wait);
    
    if (callNow) {
      func.apply(this, args);
    }
  };
}

export default {
  throttle,
  debounce
};
