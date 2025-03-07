
import { useQuery, QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { getPerformanceCategory } from '@/utils/performanceUtils';
import { captureException } from '@/utils/errorHandling';

type OptimizedQueryOptions<TQueryFnData, TError, TData, TQueryKey extends QueryKey = QueryKey> = 
  Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'> & {
    queryKey: TQueryKey;
    queryFn: () => Promise<TQueryFnData>;
    optimistic?: boolean;
    debugLabel?: string;
    lowPerfConfig?: {
      staleTime?: number;
      gcTime?: number;
      retries?: number;
      refetchInterval?: number | false;
    };
  };

/**
 * A wrapper around useQuery that optimizes query settings based on device performance
 * and provides better error handling.
 */
export function useOptimizedQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: OptimizedQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> {
  const {
    queryKey,
    queryFn,
    debugLabel = queryKey.join('-'),
    optimistic = false,
    lowPerfConfig,
    ...restOptions
  } = options;
  
  // Get device performance category
  const performanceCategory = getPerformanceCategory();
  const isLowPerformance = performanceCategory === 'low';
  
  // Default configurations
  const defaultConfig = {
    // Normal performance settings
    staleTime: optimistic ? 60000 : 300000, // 1 or 5 minutes
    gcTime: 900000, // 15 minutes
    retry: 2,
    refetchOnWindowFocus: optimistic ? true : false,
    refetchInterval: optimistic ? false : false,
    
    // Low performance adjustments
    lowPerfStaleTime: 600000, // 10 minutes
    lowPerfGCTime: 1800000, // 30 minutes
    lowPerfRetry: 1,
    lowPerfRefetchOnWindowFocus: false,
    lowPerfRefetchInterval: false,
  };
  
  // Apply performance-based configuration
  const staleTime = isLowPerformance 
    ? (lowPerfConfig?.staleTime || defaultConfig.lowPerfStaleTime)
    : defaultConfig.staleTime;
    
  const gcTime = isLowPerformance
    ? (lowPerfConfig?.gcTime || defaultConfig.lowPerfGCTime)
    : defaultConfig.gcTime;
    
  const retry = isLowPerformance
    ? (lowPerfConfig?.retries || defaultConfig.lowPerfRetry)
    : defaultConfig.retry;
    
  const refetchOnWindowFocus = isLowPerformance
    ? defaultConfig.lowPerfRefetchOnWindowFocus
    : defaultConfig.refetchOnWindowFocus;
    
  const refetchInterval = isLowPerformance
    ? (lowPerfConfig?.refetchInterval || defaultConfig.lowPerfRefetchInterval)
    : defaultConfig.refetchInterval;
  
  // Create the wrapped query function with error handling
  const wrappedQueryFn = async () => {
    try {
      return await queryFn();
    } catch (error) {
      captureException(error, `Query ${debugLabel}`);
      throw error;
    }
  };
  
  // Return the optimized query
  return useQuery({
    queryKey,
    queryFn: wrappedQueryFn,
    staleTime,
    gcTime,
    retry,
    refetchOnWindowFocus,
    refetchInterval,
    ...restOptions,
  });
}
