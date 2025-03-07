
import { useRef, useMemo, useCallback } from 'react';
import { isEqual } from 'lodash';

/**
 * A hook that performs a deep comparison of dependencies to prevent
 * unnecessary recalculations when the dependencies have the same values
 * but different references
 * 
 * @param factory The factory function to be memoized
 * @param deps The dependencies array for the factory function
 */
export function useDeepCompareMemo<T>(factory: () => T, deps: React.DependencyList): T {
  // Store previous dependencies for comparison
  const depsRef = useRef<React.DependencyList>([]);
  
  // Only update the stored dependencies when they've deeply changed
  const depsChanged = !isEqual(depsRef.current, deps);
  
  if (depsChanged) {
    depsRef.current = deps;
  }
  
  // Use stable dependency to only recalculate when the deps truly change
  return useMemo(factory, [depsChanged]);
}

/**
 * A hook that creates a callback function that only changes when its
 * dependencies have deeply changed, not just when their references change
 * 
 * @param callback The callback function to memoize
 * @param deps The dependencies array for the callback
 */
export function useDeepCompareCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  // Store previous dependencies for comparison
  const depsRef = useRef<React.DependencyList>([]);
  
  // Only update the stored dependencies when they've deeply changed
  const depsChanged = !isEqual(depsRef.current, deps);
  
  if (depsChanged) {
    depsRef.current = deps;
  }
  
  // Use stable dependency to only recreate callback when the deps truly change
  return useCallback(callback, [depsChanged]);
}
