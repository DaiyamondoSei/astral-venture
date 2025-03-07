
import { useCallback, useRef } from 'react';

/**
 * Creates a memoized selector function that only triggers re-renders
 * when the selected slice of state changes
 * 
 * @param selector Function that extracts a slice of state
 * @param equalityFn Optional custom equality function
 * @returns A memoized version of the selector function
 */
export function createSelector<State, Selected>(
  selector: (state: State) => Selected,
  equalityFn: (a: Selected, b: Selected) => boolean = (a, b) => a === b
) {
  return (state: State): Selected => {
    return selector(state);
  };
}

/**
 * Hook that provides selector pattern functionality for any state object
 * 
 * @param state The state object to select from
 * @param selector A function that extracts a piece of state
 * @param equalityFn Optional custom equality function
 * @returns The selected state slice
 */
export function useSelector<State, Selected>(
  state: State,
  selector: (state: State) => Selected,
  equalityFn: (a: Selected, b: Selected) => boolean = (a, b) => a === b
): Selected {
  const prevSelectedRef = useRef<Selected>();
  
  const getSelected = useCallback(() => {
    const selected = selector(state);
    
    // Initialize on first run
    if (prevSelectedRef.current === undefined) {
      prevSelectedRef.current = selected;
      return selected;
    }
    
    // Check if the value changed using the equality function
    if (!equalityFn(prevSelectedRef.current, selected)) {
      prevSelectedRef.current = selected;
    }
    
    return prevSelectedRef.current;
  }, [state, selector, equalityFn]);
  
  return getSelected();
}

/**
 * Deep equality function for comparing objects
 * 
 * @param a First object to compare
 * @param b Second object to compare
 * @returns Whether the objects are deeply equal
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}
