
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { getPerformanceCategory } from '@/utils/performanceUtils';

// Define the available cache strategies
type CacheStrategy = 'aggressive' | 'balanced' | 'minimal';

// Config object for the optimized query
interface OptimizedQueryConfig<TData, TError> extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  cacheStrategy?: CacheStrategy;
  offlineSupport?: boolean;
  adaptToPerformance?: boolean;
}

/**
 * Hook that provides optimized React Query functionality with:
 * - Performance-based caching strategies
 * - Offline support options
 * - Automatic stale time adjustments
 */
export function useOptimizedQuery<TData = unknown, TError = Error>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  config: OptimizedQueryConfig<TData, TError> = {}
): UseQueryResult<TData, TError> {
  const {
    cacheStrategy = 'balanced',
    offlineSupport = false,
    adaptToPerformance = true,
    ...restConfig
  } = config;
  
  // Track if we're using cached data while offline
  const isUsingOfflineCache = useRef(false);
  
  // Determine optimal stale/cache times based on strategy and device
  const getOptimizedCacheConfig = useCallback(() => {
    // Base values for different strategies
    const cacheConfigs = {
      aggressive: { staleTime: 10 * 60 * 1000, cacheTime: 60 * 60 * 1000 }, // 10min stale, 1hr cache
      balanced: { staleTime: 5 * 60 * 1000, cacheTime: 30 * 60 * 1000 }, // 5min stale, 30min cache
      minimal: { staleTime: 1 * 60 * 1000, cacheTime: 10 * 60 * 1000 }, // 1min stale, 10min cache
    };
    
    // Get base config from selected strategy
    let { staleTime, cacheTime } = cacheConfigs[cacheStrategy];
    
    // Adjust based on device capability if enabled
    if (adaptToPerformance) {
      const deviceCapability = getPerformanceCategory();
      
      if (deviceCapability === 'low') {
        // More aggressive caching for low-end devices
        staleTime *= 2;
        cacheTime *= 1.5;
      } else if (deviceCapability === 'high') {
        // Less caching for high-end devices for fresher data
        staleTime = Math.max(staleTime * 0.7, 30000); // Min 30s
      }
    }
    
    return { staleTime, cacheTime };
  }, [cacheStrategy, adaptToPerformance]);
  
  // Apply optimized cache config
  const { staleTime, cacheTime } = getOptimizedCacheConfig();
  
  // Create wrapper around query function for offline support
  const enhancedQueryFn = useCallback(async () => {
    try {
      return await queryFn();
    } catch (error) {
      // If we're requesting offline support and hit an error
      if (offlineSupport && error instanceof Error && 
          (error.message.includes('network') || error.message.includes('offline'))) {
        
        isUsingOfflineCache.current = true;
        console.log(`Using cached data for ${queryKey.join('/')} during offline/network error`);
        
        // Let react-query use the cached data by returning undefined
        // This prevents the query from going to error state
        return undefined;
      }
      
      // Re-throw for other errors
      throw error;
    }
  }, [queryFn, queryKey, offlineSupport]);
  
  // Return the optimized query
  return useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    staleTime,
    gcTime: cacheTime,
    ...restConfig
  });
}
