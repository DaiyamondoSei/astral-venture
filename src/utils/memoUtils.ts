
import { useRef, useEffect, useMemo, useCallback, DependencyList } from 'react';
import { deepEqual } from './stateSelectors';

/**
 * A hook that memoizes a value with deep comparison
 * 
 * @param factory Factory function that creates the value to memoize
 * @param deps Dependency array for recalculating the value
 * @param debugLabel Optional label for debugging
 * @returns The memoized value
 */
export function useDeepMemo<T>(
  factory: () => T,
  deps: DependencyList,
  debugLabel?: string
): T {
  const ref = useRef<{ deps: DependencyList; value: T; initialized: boolean }>({
    deps: [],
    value: undefined as unknown as T,
    initialized: false
  });

  let needsUpdate = !ref.current.initialized;
  
  if (!needsUpdate) {
    needsUpdate = deps.length !== ref.current.deps.length;
    
    if (!needsUpdate) {
      for (let i = 0; i < deps.length; i++) {
        if (!deepEqual(deps[i], ref.current.deps[i])) {
          needsUpdate = true;
          break;
        }
      }
    }
  }

  if (needsUpdate) {
    ref.current.deps = deps;
    ref.current.value = factory();
    ref.current.initialized = true;
    
    if (debugLabel && process.env.NODE_ENV === 'development') {
      console.debug(`[useDeepMemo] "${debugLabel}" recalculated`);
    }
  }

  return ref.current.value;
}

/**
 * A hook that memoizes a callback with deep comparison of dependencies
 * 
 * @param callback The callback function to memoize
 * @param deps Dependencies that determine when to create a new callback
 * @returns The memoized callback
 */
export function useDeepCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  return useDeepMemo(() => callback, deps);
}

/**
 * A hook that creates a stable reference to a value that persists
 * across renders but can be updated
 * 
 * @param initialValue The initial value
 * @returns An object with value and setValue methods
 */
export function useStableValue<T>(initialValue: T) {
  const ref = useRef(initialValue);
  
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    if (typeof newValue === 'function') {
      ref.current = (newValue as ((prev: T) => T))(ref.current);
    } else {
      ref.current = newValue;
    }
  }, []);
  
  return useMemo(() => ({
    get value() { return ref.current; },
    setValue
  }), [setValue]);
}

/**
 * A hook that tracks whether a component is mounted
 * 
 * @returns A ref object that is true when the component is mounted
 */
export function useIsMounted() {
  const isMountedRef = useRef(false);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return isMountedRef;
}

/**
 * Creates a memoized instance of a class that only changes
 * when the dependencies change
 * 
 * @param ClassConstructor The class constructor
 * @param deps Dependencies for re-instantiation
 * @param args Constructor arguments
 * @returns The memoized class instance
 */
export function useMemoizedInstance<T, Args extends any[]>(
  ClassConstructor: new (...args: Args) => T,
  deps: DependencyList,
  ...args: Args
): T {
  return useMemo(() => new ClassConstructor(...args), deps);
}
