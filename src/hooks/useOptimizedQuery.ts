
import { useQuery, UseQueryOptions, UseQueryResult, QueryClient } from '@tanstack/react-query';
import { useMediaQuery } from './useMediaQuery';
import { handleError } from '@/utils/errorHandling';

/**
 * Optimized version of useQuery that adjusts refetch behavior based on
 * device capabilities, connection status, and battery level.
 */
export function useOptimizedQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends Array<unknown> = Array<unknown>
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient
): UseQueryResult<TData, TError> {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Adjust staleTime based on device type
  const adaptedStaleTime = options.staleTime ?? (isMobile ? 5 * 60 * 1000 : 2 * 60 * 1000);
  
  // Adjust refetchOnWindowFocus based on device type and connection
  let adaptedRefetchOnWindowFocus: number | false | ((query: any) => number | false) = false;
  
  // For desktop, we might want to enable refetchOnWindowFocus
  if (!isMobile && options.refetchOnWindowFocus !== false) {
    adaptedRefetchOnWindowFocus = options.refetchOnWindowFocus ?? false;
  }
  
  // Handle errors with our custom error handler
  const onError = (error: TError) => {
    if (options.meta?.onError) {
      options.meta.onError(error);
    } else {
      handleError(error, {
        context: `Query ${options.queryKey?.toString() || 'unknown'}`,
        showToast: true,
      });
    }
  };
  
  // Pass our adapted options to the useQuery hook
  return useQuery({
    ...options,
    staleTime: adaptedStaleTime,
    refetchOnWindowFocus: adaptedRefetchOnWindowFocus,
    meta: {
      ...options.meta,
      onError
    }
  }, queryClient);
}
