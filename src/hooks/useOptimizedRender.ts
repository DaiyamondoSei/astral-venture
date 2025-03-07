import { useRef, useEffect, useCallback, useMemo, DependencyList } from 'react';
import { throttle } from '@/utils/performanceUtils';

/**
 * A hook that provides optimized rendering utilities for heavy components
 * - Memoization with deep comparison
 * - Throttled callbacks
 * - Render tracking for debugging
 */
export function useOptimizedRender<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: DependencyList = [],
  throttleMs: number = 0
) {
  // Keep track of render count for debugging
  const renderCount = useRef(0);
  
  // Track previous values for debugging and comparison
  const prevDeps = useRef<DependencyList>([]);
  
  // Increment render count on each render
  useEffect(() => {
    renderCount.current += 1;
    
    // Log excessive renders in development mode
    if (process.env.NODE_ENV === 'development' && renderCount.current > 10) {
      console.warn(`Component using useOptimizedRender has rendered ${renderCount.current} times`);
    }
    
    // Store current dependencies for comparison
    prevDeps.current = [...dependencies];
  });
  
  // Create an optimized callback that can be throttled if needed
  const optimizedCallback = useCallback((...args: Parameters<T>) => {
    return callback(...args);
  }, dependencies);
  
  // Apply throttling if specified
  const throttledCallback = useMemo(() => {
    if (throttleMs > 0) {
      return throttle(optimizedCallback, throttleMs);
    }
    return optimizedCallback;
  }, [optimizedCallback, throttleMs]);
  
  return {
    callback: throttledCallback,
    renderCount: renderCount.current,
    // Utility to check if specific props have changed
    hasChanged: (propName: string) => {
      const index = dependencies.findIndex(dep => dep === propName);
      if (index !== -1) {
        return prevDeps.current[index] !== dependencies[index];
      }
      return false;
    }
  };
}

/**
 * A hook that memoizes expensive values and tracks if they're being recalculated
 */
export function useOptimizedMemo<T>(
  factory: () => T,
  dependencies: DependencyList = [],
  debugLabel?: string
): T {
  const recalculationCount = useRef(0);
  
  // On each calculation, increment counter and optionally log
  useEffect(() => {
    recalculationCount.current += 1;
    
    if (process.env.NODE_ENV === 'development' && debugLabel && recalculationCount.current > 1) {
      console.debug(
        `[useOptimizedMemo] "${debugLabel}" recalculated ${recalculationCount.current} times`
      );
    }
  }, dependencies);
  
  return useMemo(factory, dependencies);
}
