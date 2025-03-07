
import { useCallback, useRef } from 'react';
import isEqual from 'lodash/isEqual';

/**
 * Creates a memoized selector function that only triggers rerenders when
 * the selected portion of state changes
 * 
 * @param state The complete state object
 * @param selector Function that extracts a portion of the state
 * @returns The selected portion of state, memoized by deep comparison
 */
export function createSelector<State, Selected>(
  state: State,
  selector: (state: State) => Selected
): Selected {
  const prevStateRef = useRef<State>(state);
  const prevSelectedRef = useRef<Selected>(selector(state));
  
  // Only recalculate if state reference has changed
  if (state !== prevStateRef.current) {
    const newSelected = selector(state);
    
    // Only update if the selected value has actually changed
    if (!isEqual(newSelected, prevSelectedRef.current)) {
      prevSelectedRef.current = newSelected;
    }
    
    prevStateRef.current = state;
  }
  
  return prevSelectedRef.current;
}

/**
 * A hook that creates a memoized selector function
 * 
 * @param selectorFn The selector function to memoize
 * @returns A memoized selector function that can be used with any state
 */
export function useMemoizedSelector<State, Selected>(
  selectorFn: (state: State) => Selected
) {
  return useCallback(
    (state: State) => createSelector(state, selectorFn),
    [selectorFn]
  );
}
