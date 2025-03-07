
import { useRef, useMemo, useEffect, DependencyList } from 'react';

/**
 * Deep comparison utility for complex objects
 */
function deepEqual(objA: any, objB: any): boolean {
  if (objA === objB) {
    return true;
  }
  
  if (
    typeof objA !== 'object' ||
    typeof objB !== 'object' ||
    objA === null ||
    objB === null
  ) {
    return objA === objB;
  }
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) {
    return false;
  }
  
  // Test for A's keys different from B.
  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !deepEqual(objA[key], objB[key])
    ) {
      return false;
    }
  }
  
  return true;
}

/**
 * Custom hook similar to React's useMemo but with deep comparison
 * Useful for memoizing values that are complex objects or arrays
 */
export function useDeepCompareMemo<T>(factory: () => T, deps: DependencyList): T {
  const depsRef = useRef<DependencyList>([]);
  
  // Check if deps have changed with deep comparison
  const depsChanged = !deepEqual(deps, depsRef.current);
  
  // Update deps ref if they've changed
  useEffect(() => {
    if (depsChanged) {
      depsRef.current = deps;
    }
  }, [deps, depsChanged]);
  
  // Only recompute value if deps have changed
  return useMemo(factory, [depsChanged]);
}

/**
 * Custom hook similar to React's useCallback but with deep comparison
 * Useful for optimizing callbacks with complex object dependencies
 */
export function useDeepCompareCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useDeepCompareMemo(() => callback, deps);
}

/**
 * Custom hook similar to React's useEffect but with deep comparison
 * Avoids running effects unnecessarily when complex objects appear to change but are actually the same
 */
export function useDeepCompareEffect(
  effect: React.EffectCallback,
  deps: DependencyList
): void {
  const depsRef = useRef<DependencyList>([]);
  
  // Check if deps have changed with deep comparison
  const hasChanged = !deepEqual(deps, depsRef.current);
  
  useEffect(() => {
    if (hasChanged) {
      depsRef.current = deps;
      return effect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChanged, effect]);
}
