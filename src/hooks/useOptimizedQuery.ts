
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';
import { handleError } from '@/utils/errorHandling';

/**
 * Enhanced useQuery hook with optimized performance settings and error handling
 * Compatible with @tanstack/react-query v5+
 */
export function useOptimizedQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends Array<unknown> = Array<unknown>
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> {
  // Wrap the original queryFn with error handling
  const originalQueryFn = options.queryFn;
  
  const enhancedQueryFn = useCallback(
    async (context: any) => {
      try {
        if (!originalQueryFn) {
          throw new Error('Query function is required');
        }
        return await originalQueryFn(context);
      } catch (error) {
        handleError(error, {
          context: `Query ${options.queryKey?.join(',')}`,
          showToast: true,
          severity: 'ERROR'
        });
        throw error; // Re-throw to be handled by React Query
      }
    },
    [originalQueryFn, options.queryKey]
  );
  
  // Apply optimized defaults while maintaining compatibility with TanStack Query v5+
  const optimizedOptions: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> = {
    ...options,
    queryFn: enhancedQueryFn,
    staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutes default stale time
    gcTime: options.gcTime ?? 1000 * 60 * 10, // 10 minutes default cache time
    retry: options.retry ?? 1, // Default to 1 retry
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false, // Disable refetch on window focus by default
  };
  
  return useQuery(optimizedOptions);
}
