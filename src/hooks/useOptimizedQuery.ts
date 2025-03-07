
import { useQuery, UseQueryOptions, QueryKey, UseQueryResult, QueryObserverResult } from '@tanstack/react-query';
import { usePerformance } from '@/contexts/PerformanceContext';

// Fixed version of the useOptimizedQuery hook that works with the latest react-query version
export function useOptimizedQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TQueryFnData>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
  const { isLowPerformance, isMediumPerformance } = usePerformance();
  
  // Adjust staleTime based on performance mode
  const getStaleTime = () => {
    if (isLowPerformance) {
      return 5 * 60 * 1000; // 5 minutes for low performance
    } else if (isMediumPerformance) {
      return 2 * 60 * 1000; // 2 minutes for medium performance
    }
    return 60 * 1000; // 1 minute for high performance
  };
  
  // Similarly adjust gcTime (previously cacheTime)
  const getGcTime = () => {
    if (isLowPerformance) {
      return 10 * 60 * 1000; // 10 minutes for low performance
    } else if (isMediumPerformance) {
      return 5 * 60 * 1000; // 5 minutes for medium performance
    }
    return 2 * 60 * 1000; // 2 minutes for high performance
  };
  
  // Create optimized query options based on performance profile
  const optimizedOptions = {
    ...options,
    staleTime: getStaleTime(),
    gcTime: getGcTime(),
    refetchOnWindowFocus: !isLowPerformance,
    refetchOnReconnect: !isLowPerformance,
    retry: isLowPerformance ? 1 : 3,
  };
  
  return useQuery({
    queryKey,
    queryFn,
    ...optimizedOptions
  });
}

// Optimized version of useQuery with performance adaptability and smart prefetching
export function useLazyQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TQueryFnData>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>
): [() => Promise<QueryObserverResult<TData, TError>>, UseQueryResult<TData, TError>] {
  const { isLowPerformance } = usePerformance();
  
  const query = useQuery({
    queryKey,
    queryFn,
    ...options,
    enabled: false, // This is what makes it lazy
    retry: isLowPerformance ? 1 : options?.retry ?? 3,
  });
  
  const fetch = async (): Promise<QueryObserverResult<TData, TError>> => {
    return query.refetch();
  };
  
  return [fetch, query];
}

// Smart prefetch query that adapts to performance considerations
export function useSmartPrefetchQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TQueryFnData>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
  const { isLowPerformance } = usePerformance();
  
  // Don't prefetch on low performance devices
  const isPrefetchEnabled = !isLowPerformance && options?.enabled !== false;
  
  // Create optimized options for prefetching
  const optimizedOptions = {
    ...options,
    enabled: isPrefetchEnabled,
    staleTime: isLowPerformance ? 10 * 60 * 1000 : 30 * 1000, // 10 min or 30 sec
    gcTime: isLowPerformance ? 15 * 60 * 1000 : 5 * 60 * 1000, // 15 min or 5 min
    refetchOnWindowFocus: !isLowPerformance && (options?.refetchOnWindowFocus ?? true),
    retry: isLowPerformance ? 1 : options?.retry ?? 3,
  };
  
  return useQuery({
    queryKey,
    queryFn,
    ...optimizedOptions
  });
}
