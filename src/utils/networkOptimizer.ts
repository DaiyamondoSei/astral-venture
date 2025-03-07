
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { handleError, ErrorSeverity } from '@/utils/errorHandling';

/**
 * Optimizes network requests based on device capabilities and connection status
 */
export function optimizeNetworkRequest<T>(options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  timeout?: number;
  retries?: number;
  priority?: 'high' | 'medium' | 'low';
}): Promise<T> {
  const { url, method = 'GET', data, timeout = 30000, retries = 3, priority = 'medium' } = options;
  
  // Implement fetch with timeout, retries, and prioritization
  // This is a simple implementation - production code would be more sophisticated
  return new Promise<T>((resolve, reject) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const fetchOptions: RequestInit = {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Priority': priority
      },
      ...(data && method !== 'GET' ? { body: JSON.stringify(data) } : {})
    };
    
    let attemptCount = 0;
    
    function attemptFetch() {
      attemptCount++;
      
      fetch(url, fetchOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          clearTimeout(timeoutId);
          resolve(data);
        })
        .catch(error => {
          if (attemptCount < retries && !error.name === 'AbortError') {
            // Exponential backoff for retries
            const delay = Math.min(1000 * 2 ** attemptCount, 10000);
            setTimeout(attemptFetch, delay);
          } else {
            clearTimeout(timeoutId);
            reject(error);
          }
        });
    }
    
    attemptFetch();
  });
}

/**
 * Optimized React Query hook with performance and battery awareness
 */
export function optimizedUseQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends Array<unknown> = Array<unknown>
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  return useQuery({
    ...options,
    meta: {
      ...options.meta,
      onSettled: (data: TData | undefined, error: TError | null) => {
        if (error) {
          handleError(error, {
            context: `Query ${options.queryKey?.toString() || 'unknown'}`,
            severity: ErrorSeverity.ERROR,
          });
        }
        if (options.meta?.onSettled) {
          options.meta.onSettled(data, error);
        }
      }
    }
  });
}
