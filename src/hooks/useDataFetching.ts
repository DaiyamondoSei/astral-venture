
/**
 * Enhanced Data Fetching Hook
 * 
 * Provides consistent error handling and type safety for all data fetching.
 * This eliminates the "Property does not exist on type 'never'" errors
 * by maintaining proper type information throughout the data flow.
 */

import { useState, useEffect, useCallback } from 'react';
import { Result, success, failure, isSuccess } from '@/utils/result/Result';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface FetchOptions<T> {
  /** Initial data value if any */
  initialData?: T;
  /** Whether to fetch automatically on mount */
  autoFetch?: boolean;
  /** Callback for handling errors */
  onError?: (error: Error) => void;
  /** Whether to show error toast on failure */
  showErrorToast?: boolean;
  /** Custom error message for toast */
  errorMessage?: string;
  /** Whether fetch requires authentication */
  requiresAuth?: boolean;
  /** Dependencies array for refetching */
  dependencies?: any[];
}

/**
 * General-purpose data fetching hook with proper type safety
 */
export function useDataFetching<T>(
  fetchFn: () => Promise<Result<T, Error>>,
  options: FetchOptions<T> = {}
) {
  const {
    initialData,
    autoFetch = true,
    onError,
    showErrorToast = true,
    errorMessage = 'Failed to fetch data',
    requiresAuth = false,
    dependencies = []
  } = options;

  const { user } = useAuth();
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);

  const handleError = useCallback((err: Error) => {
    setError(err);
    console.error('Data fetching error:', err);
    
    if (onError) {
      onError(err);
    }
    
    if (showErrorToast) {
      toast({
        title: 'Error',
        description: errorMessage || err.message,
        variant: 'destructive',
      });
    }
  }, [errorMessage, onError, showErrorToast]);

  const fetchData = useCallback(async (): Promise<Result<T, Error>> => {
    if (requiresAuth && !user) {
      const authError = new Error('Authentication required');
      handleError(authError);
      return failure(authError);
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      
      if (isSuccess(result)) {
        setData(result.value);
        return success(result.value);
      } else {
        handleError(result.error);
        return result;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      handleError(error);
      return failure(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, handleError, requiresAuth, user]);

  useEffect(() => {
    let mounted = true;
    
    if (autoFetch) {
      fetchData();
    }
    
    return () => {
      mounted = false;
    };
  // We intentionally exclude fetchData from dependencies to avoid infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, ...dependencies]);

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    fetchData,
    setData
  };
}

/**
 * Helper hook for fetching a single record by ID
 */
export function useRecordById<T>(
  fetchById: (id: string) => Promise<Result<T, Error>>,
  id: string | undefined,
  options: FetchOptions<T> = {}
) {
  return useDataFetching<T>(
    async () => {
      if (!id) {
        return failure(new Error('ID is required'));
      }
      return fetchById(id);
    },
    { ...options, dependencies: [id, ...(options.dependencies || [])] }
  );
}

/**
 * Helper hook for fetching records by user ID
 */
export function useRecordsByUserId<T>(
  fetchByUserId: (userId: string) => Promise<Result<T, Error>>,
  options: FetchOptions<T> = {}
) {
  const { user } = useAuth();
  
  return useDataFetching<T>(
    async () => {
      if (!user?.id) {
        return failure(new Error('User ID is required'));
      }
      return fetchByUserId(user.id);
    },
    { 
      ...options, 
      requiresAuth: true, 
      dependencies: [user?.id, ...(options.dependencies || [])] 
    }
  );
}
