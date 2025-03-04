
/**
 * Performance Utilities
 * 
 * Provides tools for monitoring and improving application performance.
 */

/**
 * Measures the execution time of a function
 * @param fn - The function to measure
 * @param fnName - Name of the function (for logging)
 * @returns A wrapped function that logs performance metrics
 */
export const measurePerformance = <T extends (...args: any[]) => any>(
  fn: T,
  fnName: string = fn.name || 'anonymous'
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = fn(...args);
    
    // For promises, measure the time until resolved
    if (result instanceof Promise) {
      result.finally(() => {
        const end = performance.now();
        console.debug(`Async ${fnName} execution time: ${(end - start).toFixed(2)}ms`);
      });
    } else {
      const end = performance.now();
      console.debug(`${fnName} execution time: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
};

/**
 * Creates a debounced version of a function
 * @param fn - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns A debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/**
 * Creates a throttled version of a function
 * @param fn - The function to throttle
 * @param limit - Time limit in milliseconds
 * @returns A throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): ((...args: Parameters<T>) => void) => {
  let waiting = false;
  let lastArgs: Parameters<T> | null = null;
  
  return (...args: Parameters<T>): void => {
    if (waiting) {
      lastArgs = args;
      return;
    }
    
    fn(...args);
    waiting = true;
    
    setTimeout(() => {
      waiting = false;
      if (lastArgs) {
        fn(...lastArgs);
        lastArgs = null;
      }
    }, limit);
  };
};

/**
 * Memoizes a function to cache its results
 * @param fn - The function to memoize
 * @returns A memoized function
 */
export const memoize = <T extends (...args: any[]) => any>(
  fn: T
): ((...args: Parameters<T>) => ReturnType<T>) => {
  const cache = new Map<string, ReturnType<T>>();
  
  return (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
