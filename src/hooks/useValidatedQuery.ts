
import { useQuery, UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

/**
 * Custom hook that wraps useQuery with automatic data validation
 * 
 * @param queryKey The query key for react-query
 * @param queryFn The query function that fetches the data
 * @param validator A function that validates the returned data
 * @param options Additional query options
 * @returns The query result with validated data
 */
export function useValidatedQuery<TData, TError>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  validator: (data: unknown) => data is TData,
  options?: Omit<UseQueryOptions<TData, TError, TData, unknown[]>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const data = await queryFn();
      
      // Validate the returned data
      if (!validator(data)) {
        console.error('Data validation failed for query:', queryKey);
        toast({
          title: 'Data Validation Error',
          description: 'The data returned from the server did not match the expected format.',
          variant: 'destructive'
        });
      }
      
      return data;
    },
    ...options
  });
}

/**
 * Version of useValidatedQuery that throws an error when validation fails
 */
export function useStrictValidatedQuery<TData, TError>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  validator: (data: unknown) => data is TData,
  options?: Omit<UseQueryOptions<TData, TError, TData, unknown[]>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const data = await queryFn();
      
      // Validate the returned data and throw error if invalid
      if (!validator(data)) {
        const error = new Error('Data validation failed for query: ' + queryKey.join(','));
        console.error(error);
        throw error;
      }
      
      return data;
    },
    ...options
  });
}
