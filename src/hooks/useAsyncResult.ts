
import { useEffect, useState, useCallback } from 'react';
import { Result, success, failure, isSuccess, isFailure } from '../utils/result/Result';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncResult<T, E = Error> {
  data: T | null;
  error: E | null;
  status: AsyncStatus;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for safely handling asynchronous operations with proper typing
 */
export function useAsyncResult<T, E = Error>(
  asyncFn: () => Promise<Result<T, E>>,
  dependencies: any[] = [],
  initialState: Partial<AsyncResult<T, E>> = {}
): AsyncResult<T, E> {
  const [data, setData] = useState<T | null>(initialState.data || null);
  const [error, setError] = useState<E | null>(initialState.error || null);
  const [status, setStatus] = useState<AsyncStatus>(initialState.status || 'idle');

  const execute = useCallback(async () => {
    setStatus('loading');
    
    try {
      const result = await asyncFn();
      
      if (isSuccess(result)) {
        setData(result.value);
        setError(null);
        setStatus('success');
      } else if (isFailure(result)) {
        setData(null);
        setError(result.error);
        setStatus('error');
      }
    } catch (unexpectedError) {
      setData(null);
      setError(unexpectedError as E);
      setStatus('error');
      console.error('Unexpected error in useAsyncResult:', unexpectedError);
    }
  }, [asyncFn]);

  useEffect(() => {
    execute();
  }, [...dependencies]);

  return {
    data,
    error,
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    refetch: execute
  };
}

/**
 * Creates an AsyncResult in the success state
 */
export function asyncSuccess<T, E = Error>(data: T): AsyncResult<T, E> {
  return {
    data,
    error: null,
    status: 'success',
    isLoading: false,
    isSuccess: true,
    isError: false,
    refetch: async () => {}
  };
}

/**
 * Creates an AsyncResult in the error state
 */
export function asyncFailure<T, E = Error>(error: E): AsyncResult<T, E> {
  return {
    data: null,
    error,
    status: 'error',
    isLoading: false,
    isSuccess: false,
    isError: true,
    refetch: async () => {}
  };
}

/**
 * Creates an AsyncResult in the loading state
 */
export function asyncLoading<T, E = Error>(): AsyncResult<T, E> {
  return {
    data: null,
    error: null,
    status: 'loading',
    isLoading: true,
    isSuccess: false,
    isError: false,
    refetch: async () => {}
  };
}
