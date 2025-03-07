
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { throttle } from '@/utils/performanceUtils';

/**
 * Enhanced version of useQuery with performance optimizations
 * - Provides smarter caching strategies
 * - Implements stale-while-revalidate pattern effectively
 * - Adds performance monitoring
 * - Throttles background refetches for performance
 */
export function useOptimizedQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData>,
  monitorLabel?: string,
  throttleInterval = 3000
): UseQueryResult<TData, TError> {
  // Track query execution time
  const startTimeRef = useRef<number>(0);
  const queryCountRef = useRef<number>(0);
  
  // Create throttled refetch for background updates
  const throttledRefetch = useRef(
    throttle((refetchFn: () => void) => {
      refetchFn();
    }, throttleInterval)
  ).current;
  
  // Extend options with optimized defaults if not specified
  const optimizedOptions: UseQueryOptions<TQueryFnData, TError, TData> = {
    // Default caching strategy
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
    ...options,
  };
  
  // Use query with enhanced options
  const queryResult = useQuery<TQueryFnData, TError, TData>(optimizedOptions);
  
  // Performance monitoring
  useEffect(() => {
    if (queryResult.isLoading && !startTimeRef.current) {
      startTimeRef.current = performance.now();
      queryCountRef.current++;
    }
    
    if (startTimeRef.current && !queryResult.isLoading) {
      const queryTime = performance.now() - startTimeRef.current;
      if (process.env.NODE_ENV !== 'production' && monitorLabel) {
        console.debug(
          `[useOptimizedQuery] ${monitorLabel} completed in ${queryTime.toFixed(1)}ms (fetch #${queryCountRef.current})`
        );
      }
      startTimeRef.current = 0;
    }
  }, [queryResult.isLoading, monitorLabel]);
  
  // Throttle background refetches to prevent performance issues
  const { refetch, isLoading } = queryResult;
  const optimizedRefetch = () => {
    if (isLoading) return;
    
    if (document.visibilityState === 'visible') {
      refetch();
    } else {
      throttledRefetch(() => refetch());
    }
  };
  
  return {
    ...queryResult,
    refetch: optimizedRefetch
  };
}

/**
 * Hook for queries that need to be cached indefinitely
 * Useful for reference data that rarely changes
 */
export function useCachedQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData>,
  monitorLabel?: string
): UseQueryResult<TData, TError> {
  const cachedOptions: UseQueryOptions<TQueryFnData, TError, TData> = {
    staleTime: Infinity, // Never becomes stale
    cacheTime: Infinity, // Never removed from cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    ...options,
  };
  
  return useOptimizedQuery(cachedOptions, monitorLabel);
}
