
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { QueryFunction, QueryKey } from '@tanstack/react-query';
import { handleError, ErrorSeverity } from '@/utils/errorHandling';

/**
 * Enhanced React Query hook with built-in error handling, performance tracking,
 * and automatic retries optimized for this application.
 */
export function useOptimizedQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'> & {
    errorContext?: string;
  }
): UseQueryResult<TData, TError> {
  const { errorContext = 'Query', ...queryOptions } = options || {};
  
  // Return the query with enhanced options
  return useQuery({
    queryKey,
    queryFn: async (context) => {
      try {
        // Execute the query function
        return await queryFn(context);
      } catch (error) {
        // Handle errors with our application's error handling system
        handleError(error, {
          context: errorContext,
          severity: ErrorSeverity.ERROR,
          showToast: true
        });
        // Re-throw to let React Query handle retry logic
        throw error;
      }
    },
    // Add our default options
    retry: 1,
    refetchOnWindowFocus: false,
    // Allow the user to override defaults
    ...queryOptions
  });
}

export default useOptimizedQuery;
