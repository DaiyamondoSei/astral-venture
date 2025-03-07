
import { useCallback, useMemo, useRef } from 'react';
import isEqual from 'lodash/isEqual';

/**
 * Custom hook for deep comparison memoization
 * Prevents unnecessary re-renders when comparing complex objects
 * 
 * @param value The value to memoize
 * @returns The memoized value
 */
export function useDeepMemo<T>(value: T): T {
  const ref = useRef<T>(value);
  
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Custom hook for creating a callback with deep dependency comparison
 * Prevents unnecessary re-renders when dependencies are complex objects
 * 
 * @param callback The callback function to memoize
 * @param dependencies The dependency array for the callback
 * @returns The memoized callback
 */
export function useDeepCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  // Use deep memoization for dependencies
  const memoizedDeps = useDeepMemo(dependencies);
  
  // Memoize the callback with the deep-compared dependencies
  return useCallback(callback, [memoizedDeps]) as T;
}

/**
 * Custom hook for creating a selector function
 * Prevents unnecessary re-renders by only updating when selected value changes
 * 
 * @param state The state object
 * @param selector Function to select a portion of the state
 * @returns The selected state portion
 */
export function useSelector<T, S>(state: T, selector: (state: T) => S): S {
  const prevSelectedState = useRef<S>(selector(state));
  const prevState = useRef<T>(state);
  
  if (state !== prevState.current) {
    const selectedState = selector(state);
    if (!isEqual(selectedState, prevSelectedState.current)) {
      prevSelectedState.current = selectedState;
    }
    prevState.current = state;
  }
  
  return prevSelectedState.current;
}
