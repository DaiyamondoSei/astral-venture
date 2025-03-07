/**
 * Network Optimizer - Provides utilities for optimizing network requests
 * and data fetching in the application
 */

// Track ongoing network requests to prevent redundant calls
const activeRequests = new Map<string, Promise<any>>();

// Deduplicates identical network requests that happen simultaneously
export function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // If this exact request is already in progress, return the existing promise
  if (activeRequests.has(key)) {
    return activeRequests.get(key) as Promise<T>;
  }
  
  // Otherwise, make the new request and track it
  const promise = requestFn()
    .finally(() => {
      // Remove from active requests when completed (whether success or error)
      activeRequests.delete(key);
    });
  
  activeRequests.set(key, promise);
  return promise;
}

// Configures optimal settings for Tanstack Query
export function getOptimalQueryConfig(priority: 'high' | 'medium' | 'low' = 'medium') {
  // Base config that works well for most cases
  const baseConfig = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  };
  
  // Adjust based on priority
  switch (priority) {
    case 'high':
      return {
        ...baseConfig,
        staleTime: 60 * 1000, // 1 minute
        retry: 3,
        refetchOnWindowFocus: true,
      };
    case 'low':
      return {
        ...baseConfig,
        staleTime: 15 * 60 * 1000, // 15 minutes
        cacheTime: 60 * 60 * 1000, // 1 hour
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      };
    default:
      return baseConfig;
  }
}

// Preload data that will likely be needed soon
export function preloadQueryData<T>(
  queryClient: any,
  queryKey: unknown[],
  queryFn: () => Promise<T>
): void {
  // Only preload if network is not constrained
  if (navigator.connection && 
      (navigator.connection as any).saveData) {
    console.log('Skipping preload due to saveData mode');
    return;
  }
  
  queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Optimize image loading for network conditions
export function getOptimizedImageUrl(
  baseUrl: string,
  options: {
    width?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'original';
  } = {}
): string {
  // Default options
  const { 
    width = undefined,
    quality = undefined,
    format = undefined
  } = options;
  
  // If no optimizations needed, return the original URL
  if (!width && !quality && !format) {
    return baseUrl;
  }
  
  // Start building the optimized URL
  const url = new URL(baseUrl, window.location.origin);
  const params = new URLSearchParams(url.search);
  
  // Add optimization parameters
  if (width) params.set('w', width.toString());
  if (quality) params.set('q', quality.toString());
  if (format && format !== 'original') params.set('fmt', format);
  
  // Apply connection-aware optimizations
  if (navigator.connection) {
    const connection = navigator.connection as any;
    // For slow connections, reduce quality further
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      params.set('q', '60');
    }
    // For save-data mode, use lowest acceptable quality
    if (connection.saveData) {
      params.set('q', '50');
    }
  }
  
  url.search = params.toString();
  return url.toString();
}

// Adapts fetch timeouts based on network conditions
export async function adaptiveFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let timeout = 30000; // Default 30 seconds
  
  // Adjust timeout based on connection quality
  if (navigator.connection) {
    const connection = navigator.connection as any;
    if (connection.effectiveType === '4g') {
      timeout = 10000; // 10 seconds for fast connections
    } else if (connection.effectiveType === '3g') {
      timeout = 20000; // 20 seconds for medium connections
    } else {
      timeout = 60000; // 60 seconds for slow connections
    }
  }
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Export utility for creating optimal network-aware React Query hooks
export function createNetworkAwareQueryHook(queryClient: any) {
  return function useNetworkAwareQuery(queryKey: unknown[], queryFn: () => Promise<any>, options = {}) {
    // Get network-optimized configuration
    const connectionType = (navigator.connection as any)?.effectiveType || '4g';
    const isSlowConnection = connectionType === 'slow-2g' || connectionType === '2g';
    
    const priority = isSlowConnection ? 'low' : 'medium';
    const optimizedConfig = getOptimalQueryConfig(priority);
    
    // Return configured query
    return queryClient.useQuery({
      queryKey,
      queryFn,
      ...optimizedConfig,
      ...options
    });
  };
}
