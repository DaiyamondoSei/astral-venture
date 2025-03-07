
import React, { createContext, useContext, useMemo, useCallback, useState, ReactNode } from 'react';

/**
 * Creates an optimized context and provider with automatic memoization
 * to prevent unnecessary re-renders
 */
export function createOptimizedContext<T>(defaultValue: T) {
  // Create the context
  const Context = createContext<T>(defaultValue);
  
  // Create optimized provider
  const OptimizedProvider = ({ 
    children, 
    value 
  }: { 
    children: ReactNode;
    value: T;
  }) => {
    // Memoize the context value to prevent unnecessary re-renders
    const memoizedValue = useMemo(() => value, [
      // Use JSON stringify for complex objects comparison
      // This is a performance tradeoff - slight CPU cost for fewer re-renders
      JSON.stringify(value)
    ]);
    
    return (
      <Context.Provider value={memoizedValue}>
        {children}
      </Context.Provider>
    );
  };
  
  // Create selector hook to access only specific parts of context
  const useContextSelector = <K extends keyof T>(selector: K): T[K] => {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error('useContextSelector must be used within the Provider');
    }
    return context[selector];
  };
  
  return {
    Context,
    Provider: OptimizedProvider,
    useContext: () => useContext(Context),
    useContextSelector
  };
}

/**
 * Creates a state management context with optimized selectors
 * to prevent unnecessary re-renders
 */
export function createStateContext<State, Actions>(
  initialState: State,
  actionsFactory: (state: State, setState: React.Dispatch<React.SetStateAction<State>>) => Actions
) {
  // Create context for both state and actions
  const StateContext = createContext<State | undefined>(undefined);
  const ActionsContext = createContext<Actions | undefined>(undefined);
  
  // Create the provider component
  const Provider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<State>(initialState);
    
    // Memoize actions to prevent unnecessary re-renders
    const actions = useMemo(
      () => actionsFactory(state, setState),
      [state]
    );
    
    return (
      <StateContext.Provider value={state}>
        <ActionsContext.Provider value={actions}>
          {children}
        </ActionsContext.Provider>
      </StateContext.Provider>
    );
  };
  
  // Create hooks to access state and actions
  const useState = () => {
    const context = useContext(StateContext);
    if (context === undefined) {
      throw new Error('useState must be used within a Provider');
    }
    return context;
  };
  
  const useActions = () => {
    const context = useContext(ActionsContext);
    if (context === undefined) {
      throw new Error('useActions must be used within a Provider');
    }
    return context;
  };
  
  // Create a selector hook for accessing only part of the state
  const useStateSelector = <K extends keyof State>(selector: K): State[K] => {
    const state = useState();
    return state[selector];
  };
  
  return {
    Provider,
    useState,
    useActions,
    useStateSelector
  };
}
