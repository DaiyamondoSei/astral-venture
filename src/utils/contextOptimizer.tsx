
import React, { 
  createContext, 
  useContext, 
  useMemo, 
  useCallback, 
  useState, 
  useSyncExternalStore,
  ReactNode 
} from 'react';

/**
 * Context Optimizer
 * 
 * Creates optimized contexts that only re-render components
 * when their specific selections change, not on every context update.
 */

type Listener = () => void;
type Selector<T, S> = (state: T) => S;
type EqualityFn<S> = (a: S, b: S) => boolean;

// Default equality function
const defaultCompare = <S,>(a: S, b: S): boolean => a === b;

/**
 * Creates an optimized context with selective updates
 */
export function createOptimizedContext<T>(initialState: T) {
  // Internal store implementation
  const listeners = new Set<Listener>();
  let currentState = initialState;
  
  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  
  const getState = () => currentState;
  
  const setState = (
    newState: T | ((prevState: T) => T),
    options?: { batch?: boolean }
  ) => {
    const nextState = typeof newState === 'function'
      ? (newState as ((prevState: T) => T))(currentState)
      : newState;
    
    // Skip update if state is the same object
    if (nextState === currentState) {
      return;
    }
    
    // Update state
    currentState = nextState;
    
    // Notify listeners
    if (options?.batch) {
      // In batched mode, schedule notifications
      queueMicrotask(() => {
        listeners.forEach(listener => listener());
      });
    } else {
      // Immediately notify
      listeners.forEach(listener => listener());
    }
  };
  
  // Create React context
  const StateContext = createContext<T | undefined>(undefined);
  
  // Create provider component
  const Provider = ({ children, value }: { children: ReactNode; value?: T }) => {
    // If a value is provided, use it directly
    const [store] = useState(() => {
      if (value !== undefined) {
        currentState = value;
      }
      return { getState, subscribe };
    });
    
    // Create memoized context value
    const contextValue = useMemo(() => {
      return value !== undefined ? value : currentState;
    }, [value]);
    
    return (
      <StateContext.Provider value={contextValue}>
        {children}
      </StateContext.Provider>
    );
  };
  
  // Create selector hook
  function useSelector<S>(
    selector: Selector<T, S>,
    equalityFn: EqualityFn<S> = defaultCompare
  ): S {
    const store = useContext(StateContext);
    
    if (store === undefined) {
      throw new Error('useSelector must be used within a Provider');
    }
    
    // Get selected state using useSyncExternalStore
    return useSyncExternalStore(
      subscribe,
      // Get snapshot of selected state
      () => {
        const state = getState();
        return selector(state);
      },
      // Get server snapshot (for SSR)
      () => selector(initialState),
      // Custom equality function through memoization
      equalityFn
    );
  }
  
  // Create setter hook
  const useSetState = () => {
    return useCallback(setState, []);
  };
  
  return {
    Provider,
    useSelector,
    useSetState,
    getState,
    setState,
  };
}

/**
 * Creates a performance-optimized store with selectors
 * Similar to Redux but much lighter and integrated with React context
 */
export function createOptimizedStore<T>(initialState: T) {
  const context = createOptimizedContext(initialState);
  
  return {
    Provider: context.Provider,
    useStore: <S,>(selector: Selector<T, S> = (state: T) => state as unknown as S) => {
      return context.useSelector(selector);
    },
    useDispatch: () => context.useSetState(),
    getState: context.getState,
    dispatch: context.setState,
  };
}

/**
 * Deep equality comparison function for complex objects
 * Use with selectors when full deep equality is needed
 */
export function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  
  if (
    typeof a !== 'object' || 
    typeof b !== 'object' || 
    a === null || 
    b === null
  ) {
    return a === b;
  }
  
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => {
    return Object.prototype.hasOwnProperty.call(b, key) && 
      deepEqual((a as any)[key], (b as any)[key]);
  });
}
