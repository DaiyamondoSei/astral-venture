
/**
 * useAsyncResult Hook
 * 
 * A React hook for safely using the Result pattern with async operations,
 * providing type-safe error handling and loading states.
 */

import { useState, useEffect, useCallback } from 'react';
import { Result, isSuccess, isFailure } from '../utils/result/Result';
import { asyncResultify } from '../utils/result/AsyncResult';

/**
 * Async operation state
 */
export interface AsyncState<T, E> {
  data: T | null;
  error: E | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Async operation controller
 */
export interface AsyncController<T, E, P extends any[]> {
  execute: (...params: P) => Promise<void>;
  reset: () => void;
}

/**
 * Hook return type
 */
export type UseAsyncResultReturn<T, E, P extends any[]> = 
  AsyncState<T, E> & AsyncController<T, E, P>;

/**
 * Custom hook for handling async operations with Result pattern
 * 
 * @param asyncFn - Async function that returns a Result
 * @param immediate - Whether to execute immediately
 * @param initialParams - Initial parameters for immediate execution
 * @returns Async state and controller
 */
export function useAsyncResult<T, E, P extends any[]>(
  asyncFn: (...params: P) => Promise<Result<T, E>>,
  immediate = false,
  initialParams?: P
): UseAsyncResultReturn<T, E, P> {
  const [state, setState] = useState<AsyncState<T, E>>({
    data: null,
    error: null,
    isLoading: immediate,
    isSuccess: false,
    isError: false
  });

  const execute = useCallback(async (...params: P) => {
    setState(prev => ({ ...prev, isLoading: true, isSuccess: false, isError: false }));
    
    try {
      const result = await asyncFn(...params);
      
      if (isSuccess(result)) {
        setState({
          data: result.value,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false
        });
      } else if (isFailure(result)) {
        setState({
          data: null,
          error: result.error,
          isLoading: false,
          isSuccess: false,
          isError: true
        });
      }
    } catch (error) {
      // This should rarely happen as the Result pattern should capture all errors
      console.error('Unhandled error in useAsyncResult:', error);
      
      setState({
        data: null,
        error: error as E,
        isLoading: false,
        isSuccess: false,
        isError: true
      });
    }
  }, [asyncFn]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false
    });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute(...(initialParams || [] as unknown as P));
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    reset
  };
}

/**
 * Hook that converts an async function to use Result pattern
 * 
 * @param asyncFn - Async function to convert
 * @param immediate - Whether to execute immediately
 * @param initialParams - Initial parameters for immediate execution
 * @returns Async state and controller
 */
export function useAsync<T, P extends any[]>(
  asyncFn: (...params: P) => Promise<T>,
  immediate = false,
  initialParams?: P
): UseAsyncResultReturn<T, Error, P> {
  const wrappedFn = useCallback(
    asyncResultify(asyncFn),
    [asyncFn]
  );
  
  return useAsyncResult(wrappedFn, immediate, initialParams);
}
