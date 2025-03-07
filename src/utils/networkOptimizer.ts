
import { useQuery, useQueryClient, QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

// Optimized query hook that adapts to network conditions
export function useAdaptiveQuery<TData, TError>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'>
) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkType, setNetworkType] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();
  
  // Create optimized options based on network state
  const adaptiveOptions = {
    ...options,
    gcTime: isOnline ? 
      (networkType === '4g' ? 5 * 60 * 1000 : 10 * 60 * 1000) : // 5min for 4G, 10min otherwise
      30 * 60 * 1000, // 30min when offline
    staleTime: isOnline ? 
      (networkType === '4g' ? 30 * 1000 : 2 * 60 * 1000) : // 30sec for 4G, 2min otherwise
      Infinity, // Don't refetch when offline
    retry: isOnline ? (options?.retry ?? 3) : 0, // No retries when offline
    refetchOnWindowFocus: isOnline && (options?.refetchOnWindowFocus ?? true),
    refetchOnReconnect: isOnline && (options?.refetchOnReconnect ?? true),
  };

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Try to get network type if the API is available
    if ('connection' in navigator && navigator.connection) {
      try {
        // Using type assertion since TS doesn't know about this API
        const connection = (navigator as any).connection;
        if (connection && connection.effectiveType) {
          setNetworkType(connection.effectiveType);
        }
        
        const handleChange = () => {
          if (connection && connection.effectiveType) {
            setNetworkType(connection.effectiveType);
          }
        };
        
        connection.addEventListener('change', handleChange);
        return () => {
          connection.removeEventListener('change', handleChange);
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      } catch (e) {
        console.warn('NetworkInformation API error:', e);
      }
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Prevent unnecessary re-renders when network type doesn't affect behavior
  const optimizedNetworkType = networkType === '4g' || networkType === 'wifi' ? 'fast' : 'slow';
  
  return useQuery({
    queryKey,
    queryFn,
    ...adaptiveOptions
  });
}

// Prefetch URLs when network conditions are favorable
export function useOptimizedPrefetch(urls: string[]) {
  const [prefetchedUrls, setPrefetchedUrls] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isIdleCallbackSupported] = useState('requestIdleCallback' in window);
  const [networkType, setNetworkType] = useState<string | undefined>(undefined);
  
  // Track which URLs have been prefetched
  const prefetchTracker = useRef<Set<string>>(new Set());

  // Helper to prefetch a URL
  const prefetchUrl = (url: string) => {
    // Only prefetch if online and not already prefetched
    if (isOnline && !prefetchTracker.current.has(url)) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = url.endsWith('.js') ? 'script' : 
                url.endsWith('.css') ? 'style' : 
                url.endsWith('.json') ? 'fetch' :
                'document';
      link.onload = () => {
        prefetchTracker.current.add(url);
        setPrefetchedUrls(prev => [...prev, url]);
      };
      document.head.appendChild(link);
    }
  };
  
  // Determine if prefetching is appropriate based on network conditions
  const shouldPrefetch = () => {
    if (!isOnline) return false;
    
    // Prefetch on fast connections
    if (networkType === '4g' || networkType === 'wifi' || networkType === 'fast') {
      return true;
    }
    
    // Don't prefetch on slow connections unless explicitly set
    return false;
  };
  
  // Update online status and network information
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Try to get network type if available
    if ('connection' in navigator) {
      try {
        const connection = (navigator as any).connection;
        if (connection && connection.effectiveType) {
          setNetworkType(connection.effectiveType);
        }
        
        const handleChange = () => {
          if (connection && connection.effectiveType) {
            setNetworkType(connection.effectiveType);
          }
        };
        
        connection.addEventListener('change', handleChange);
        return () => {
          connection.removeEventListener('change', handleChange);
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      } catch (e) {
        console.warn('NetworkInformation API error:', e);
      }
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Start prefetching URLs when appropriate
  useEffect(() => {
    if (!shouldPrefetch() || urls.length === 0) return;
    
    const prefetchUrls = () => {
      urls.forEach((url, index) => {
        // Stagger prefetching to avoid network congestion
        setTimeout(() => prefetchUrl(url), index * 300);
      });
    };
    
    // Use requestIdleCallback if supported
    if (isIdleCallbackSupported) {
      (window as any).requestIdleCallback(() => prefetchUrls(), { timeout: 2000 });
    } else {
      // Fall back to setTimeout
      setTimeout(prefetchUrls, 1000);
    }
  }, [urls, isOnline, networkType, isIdleCallbackSupported]);
  
  return prefetchedUrls;
}
