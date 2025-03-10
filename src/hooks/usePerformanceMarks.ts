
/**
 * Hook for working with performance marks and measures
 * 
 * Allows components to create and measure performance spans easily
 */

import { useCallback, useEffect, useRef } from 'react';
import { markStart, markEnd } from '@/utils/webVitalsMonitor';

interface UsePerformanceMarksOptions {
  componentName: string;
  autoMarkMount?: boolean;
  autoMarkUnmount?: boolean;
}

/**
 * Hook to create and measure performance marks
 */
export function usePerformanceMarks(options: UsePerformanceMarksOptions) {
  const { 
    componentName, 
    autoMarkMount = true, 
    autoMarkUnmount = true 
  } = options;
  
  const isMounted = useRef(false);
  
  // Create a mark name with proper prefix
  const getMarkName = useCallback((name: string) => {
    return `${componentName}:${name}`;
  }, [componentName]);
  
  // Start a performance mark
  const startMark = useCallback((name: string) => {
    markStart(getMarkName(name));
  }, [getMarkName]);
  
  // End a performance mark and record it
  const endMark = useCallback((name: string, category?: 'navigation' | 'rendering' | 'resource' | 'custom') => {
    markEnd(getMarkName(name), category);
  }, [getMarkName]);
  
  // Create a wrapped function that measures execution time
  const withTiming = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    markName: string
  ) => {
    return ((...args: Parameters<T>): ReturnType<T> => {
      startMark(markName);
      const result = fn(...args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result
          .then(value => {
            endMark(markName);
            return value;
          })
          .catch(error => {
            endMark(markName);
            throw error;
          }) as ReturnType<T>;
      }
      
      endMark(markName);
      return result;
    }) as T;
  }, [startMark, endMark]);
  
  // Auto-mark component mount and unmount
  useEffect(() => {
    if (autoMarkMount) {
      const mountMarkName = getMarkName('mount');
      markStart(mountMarkName);
      
      // Mark render complete on next frame
      const rafId = requestAnimationFrame(() => {
        markEnd(mountMarkName, 'rendering');
        isMounted.current = true;
      });
      
      return () => {
        cancelAnimationFrame(rafId);
        
        if (autoMarkUnmount && isMounted.current) {
          const unmountMarkName = getMarkName('unmount');
          markStart(unmountMarkName);
          
          // We can't actually track the end of unmount with a useEffect cleanup,
          // but we can at least record the start of the unmount process
          markEnd(unmountMarkName, 'rendering');
        }
      };
    }
  }, [autoMarkMount, autoMarkUnmount, getMarkName]);
  
  return {
    startMark,
    endMark,
    withTiming
  };
}

export default usePerformanceMarks;
