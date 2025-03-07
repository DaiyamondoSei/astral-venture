
/**
 * Utility for deep comparison of objects
 * Used by memoization utilities
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (
    typeof a !== 'object' || 
    a === null || 
    typeof b !== 'object' || 
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

/**
 * Creates a selector function that memoizes its result
 * and only recalculates when dependencies change
 */
export function createSelector<State, Result>(
  dependencies: ((state: State) => any)[],
  selector: (...deps: any[]) => Result
): (state: State) => Result {
  let cachedResult: Result;
  let cachedDeps: any[] = [];
  let initialized = false;
  
  return (state: State) => {
    const currentDeps = dependencies.map(dep => dep(state));
    
    // Check if dependencies have changed
    const shouldRecalculate = !initialized || !depsEqual(currentDeps, cachedDeps);
    
    if (shouldRecalculate) {
      cachedResult = selector(...currentDeps);
      cachedDeps = currentDeps;
      initialized = true;
    }
    
    return cachedResult;
  };
}

// Helper to compare dependency arrays
function depsEqual(newDeps: any[], oldDeps: any[]): boolean {
  if (newDeps.length !== oldDeps.length) return false;
  
  for (let i = 0; i < newDeps.length; i++) {
    if (!deepEqual(newDeps[i], oldDeps[i])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Creates a selector that extracts a specific property
 */
export function createPropertySelector<State, Prop extends keyof State>(prop: Prop) {
  return (state: State) => state[prop];
}

/**
 * Creates a filtered selector that applies a filter function to an array
 */
export function createFilteredSelector<State, Item>(
  arraySelector: (state: State) => Item[],
  filterFn: (item: Item) => boolean
): (state: State) => Item[] {
  return createSelector(
    [arraySelector],
    (items) => items.filter(filterFn)
  );
}
