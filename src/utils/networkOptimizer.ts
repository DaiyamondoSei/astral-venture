
/**
 * Network optimization utilities
 * Improves data fetching performance, caching, and bandwidth usage
 */

import { QueryClient } from '@tanstack/react-query';

// Create a globally optimized QueryClient
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Optimize for performance
        staleTime: 60 * 1000, // 1 minute
        cacheTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false, // Disable by default for better performance
        retry: 1, // Limit retries to avoid excessive network requests
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        networkMode: 'online', // Only fetch when online
      },
      mutations: {
        networkMode: 'online',
        retry: 1,
      },
    },
  });
};

// Optimized fetch function with smart defaults
export const optimizedFetch = async (
  url: string,
  options?: RequestInit & { priority?: 'high' | 'low' | 'auto' }
): Promise<Response> => {
  // Set reasonable defaults
  const defaultOptions: RequestInit = {
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    // Include defaults from options
    ...options,
  };

  // Add fetch priority if supported
  if (options?.priority && 'priority' in Request.prototype) {
    (defaultOptions as any).priority = options.priority;
  }

  // Add performance timing for network monitoring
  const startTime = performance.now();
  try {
    const response = await fetch(url, defaultOptions);
    
    // Log performance for development
    if (process.env.NODE_ENV === 'development') {
      const duration = performance.now() - startTime;
      console.debug(`[Network] ${options?.method || 'GET'} ${url}: ${duration.toFixed(0)}ms`);
    }
    
    return response;
  } catch (error) {
    console.error(`[Network] Error fetching ${url}:`, error);
    throw error;
  }
};

// Preconnect to important domains (call at app start)
export const preconnectToCriticalDomains = (domains: string[]) => {
  if (typeof document === 'undefined') return;
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Connection-aware fetch with network condition adaptations
export const connectionAwareFetch = async (
  url: string, 
  options?: RequestInit,
  lowBandwidthAlternative?: string
): Promise<Response> => {
  // Check for network conditions if available
  if (navigator.connection) {
    const connection = navigator.connection as any;
    const isSlowConnection = connection.downlink < 1 || connection.saveData || connection.effectiveType === 'slow-2g';
    
    // Use lower quality alternative for slow connections
    if (isSlowConnection && lowBandwidthAlternative) {
      return optimizedFetch(lowBandwidthAlternative, options);
    }
    
    // Adjust fetch parameters for connection speed
    if (isSlowConnection) {
      return optimizedFetch(url, {
        ...options,
        priority: 'low',
        cache: 'force-cache',
      });
    }
  }
  
  return optimizedFetch(url, options);
};

// Enable HTTP/2 Server Push hint for critical resources
export const addResourceHint = (url: string, as: 'script' | 'style' | 'image' | 'font') => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = url;
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
};
