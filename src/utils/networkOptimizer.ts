
import { useQuery, useMutation, QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { getPerformanceCategory } from './performanceUtils';

type RetryValue<TError> = number | boolean | ((failureCount: number, error: TError) => boolean);

interface OptimizedNetworkOptions {
  /** Stale time for caching (ms) */
  staleTime?: number;
  /** Garbage collection time (ms) */
  gcTime?: number;
  /** Whether to refetch on window focus */
  refetchOnFocus?: boolean;
  /** Whether to retry failed queries */
  retry?: boolean | number;
  /** Whether to show error toasts automatically */
  showErrorToasts?: boolean;
  /** Context for error messages */
  errorContext?: string;
}

/**
 * Creates an optimized query function that adapts to device performance capabilities
 */
export function createOptimizedQuery<TData = unknown, TError = Error, TQueryKey extends QueryKey = QueryKey>(
  options: OptimizedNetworkOptions = {}
) {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes default
    gcTime = 10 * 60 * 1000, // 10 minutes default
    refetchOnFocus = false,
    retry = 1,
    showErrorToasts = true,
    errorContext = 'query'
  } = options;
  
  // Get performance category (high, medium, low)
  const deviceCapability = getPerformanceCategory();
  
  // Adjust settings based on device capability
  const optimizedStaleTime = deviceCapability === 'low' ? staleTime * 2 : staleTime;
  const optimizedGCTime = deviceCapability === 'low' ? gcTime * 2 : gcTime;
  const optimizedRefetchOnFocus = deviceCapability === 'low' ? false : refetchOnFocus;
  
  // Create optimized query function
  return function optimizedQuery<TQueryFnData = TData>(
    queryKey: TQueryKey,
    queryFn: () => Promise<TQueryFnData>,
    customOptions: Partial<UseQueryOptions<TQueryFnData, TError, TQueryFnData, TQueryKey>> = {}
  ): UseQueryResult<TQueryFnData, TError> {
    const handleError = (error: TError) => {
      console.error(`Error in ${errorContext}:`, error);
      
      if (showErrorToasts) {
        toast({
          title: `Error in ${errorContext}`,
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          variant: "destructive"
        });
      }
      
      return error;
    };
    
    return useQuery({
      gcTime: optimizedGCTime,
      staleTime: optimizedStaleTime,
      retry: retry as RetryValue<TError>,
      refetchOnWindowFocus: optimizedRefetchOnFocus,
      queryKey,
      queryFn,
      onError: handleError,
      ...customOptions
    });
  };
}

/**
 * Creates optimized mutation options that adapt to device capabilities
 */
export function createOptimizedMutation(
  options: {
    showSuccessToasts?: boolean;
    showErrorToasts?: boolean;
    successMessage?: string;
    errorContext?: string;
  } = {}
) {
  const {
    showSuccessToasts = true,
    showErrorToasts = true,
    successMessage = 'Operation completed successfully',
    errorContext = 'mutation'
  } = options;
  
  return {
    onSuccess: () => {
      if (showSuccessToasts) {
        toast({
          title: 'Success',
          description: successMessage
        });
      }
    },
    
    onError: (error: Error) => {
      console.error(`Error in ${errorContext}:`, error);
      
      if (showErrorToasts) {
        toast({
          title: `Error in ${errorContext}`,
          description: error.message || 'An unexpected error occurred',
          variant: "destructive"
        });
      }
    }
  };
}
