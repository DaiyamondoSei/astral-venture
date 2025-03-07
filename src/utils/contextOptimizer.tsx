
import React, { createContext, useContext, useReducer, useCallback, ReactNode, Dispatch, useMemo } from 'react';

/**
 * Creates an optimized context with selectors to prevent unnecessary re-renders
 */
export function createOptimizedContext<State, Action>(
  initialState: State,
  reducer: (state: State, action: Action) => State,
  displayName = 'OptimizedContext'
) {
  // Create the context with a default value that includes both state and dispatch
  const Context = createContext<{
    state: State;
    dispatch: Dispatch<Action>;
  } | undefined>(undefined);
  
  // Set display name for debugging
  Context.displayName = displayName;
  
  // Create the provider component
  const Provider = ({ children, initialOverrides }: { children: ReactNode, initialOverrides?: Partial<State> }) => {
    // Merge initial state with any overrides
    const mergedInitialState = {
      ...initialState,
      ...(initialOverrides || {})
    } as State;
    
    // Use reducer for state management
    const [state, dispatch] = useReducer(reducer, mergedInitialState);
    
    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => {
      return { state, dispatch };
    }, [state]);
    
    return (
      <Context.Provider value={contextValue}>
        {children}
      </Context.Provider>
    );
  };
  
  // Create a custom hook for consuming the context
  const useOptimizedContext = () => {
    const context = useContext(Context);
    
    if (context === undefined) {
      throw new Error(`use${displayName} must be used within a ${displayName}Provider`);
    }
    
    return context;
  };
  
  // Create a selector hook to extract specific parts of state
  const useSelector = <Selected extends unknown>(
    selector: (state: State) => Selected
  ): Selected => {
    const { state } = useOptimizedContext();
    return selector(state);
  };
  
  // Create a hook to get the dispatch function
  const useDispatch = () => {
    const { dispatch } = useOptimizedContext();
    return dispatch;
  };
  
  // Create a hook to get an action creator 
  const useAction = <T extends (...args: any[]) => Action>(
    actionCreator: T
  ): ((...args: Parameters<T>) => void) => {
    const dispatch = useDispatch();
    
    return useCallback(
      (...args: Parameters<T>) => {
        dispatch(actionCreator(...args));
      },
      [actionCreator, dispatch]
    );
  };
  
  return {
    Provider,
    useContext: useOptimizedContext,
    useSelector,
    useDispatch,
    useAction
  };
}
