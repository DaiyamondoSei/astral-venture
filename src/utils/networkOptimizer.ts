
import { captureException } from '@/utils/errorHandling';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  priority?: 'high' | 'normal' | 'low';
  cacheStrategy?: 'no-cache' | 'cache-first' | 'network-first';
}

/**
 * Optimized network request handler with smart caching, request prioritization,
 * and bandwidth optimization
 */
export async function optimizedFetch<T = any>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = 'GET',
    body,
    headers = {},
    timeout = 30000,
    retries = 2,
    priority = 'normal',
    cacheStrategy = 'network-first'
  } = options;
  
  // Priority queuing
  if (priority === 'low') {
    // Defer low-priority requests
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // Check cache if the strategy is cache-first
  if (cacheStrategy === 'cache-first') {
    try {
      const cachedResponse = await getCachedResponse(url);
      if (cachedResponse) {
        return cachedResponse as T;
      }
    } catch (error) {
      console.warn('Cache retrieval failed, falling back to network request', error);
    }
  }
  
  // Configure request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // Add default headers
  const fetchHeaders = new Headers(headers);
  if (!fetchHeaders.has('Content-Type') && method !== 'GET' && body) {
    fetchHeaders.set('Content-Type', 'application/json');
  }
  
  // Prepare request options
  const fetchOptions: RequestInit = {
    method,
    headers: fetchHeaders,
    signal: controller.signal,
    ...(body && method !== 'GET' ? { body: JSON.stringify(body) } : {})
  };
  
  // Network request with retry logic
  let attempt = 0;
  let lastError: Error | null = null;
  
  while (attempt <= retries) {
    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache response if needed
      if (cacheStrategy !== 'no-cache') {
        try {
          await cacheResponse(url, data);
        } catch (cacheError) {
          console.warn('Failed to cache response', cacheError);
        }
      }
      
      return data as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if it was a abort error
      if (lastError.name === 'AbortError') {
        break;
      }
      
      console.warn(`Request attempt ${attempt + 1}/${retries + 1} failed:`, lastError);
      attempt++;
      
      if (attempt <= retries) {
        // Exponential backoff
        const backoffTime = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  
  // All retries failed
  captureException(lastError!, `Failed request to ${url} after ${retries + 1} attempts`);
  throw lastError;
}

// Cache utilities
async function getCachedResponse(url: string): Promise<any | null> {
  try {
    if (!('caches' in window)) {
      return null;
    }
    
    const cache = await caches.open('quantum-network-cache');
    const response = await cache.match(url);
    
    if (!response) return null;
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Cache retrieval error:', error);
    return null;
  }
}

async function cacheResponse(url: string, data: any): Promise<void> {
  try {
    if (!('caches' in window)) {
      return;
    }
    
    const cache = await caches.open('quantum-network-cache');
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(url, response);
  } catch (error) {
    console.warn('Cache storage error:', error);
  }
}

// Batch request utilities for reducing network overhead
export function batchRequests<T = any>(
  requests: RequestOptions[],
  batchSize = 3
): Promise<T[]> {
  const batches: RequestOptions[][] = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    batches.push(requests.slice(i, i + batchSize));
  }
  
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    let completedBatches = 0;
    
    batches.forEach(async (batchRequests, index) => {
      try {
        // Process each batch in parallel
        const batchResults = await Promise.all(
          batchRequests.map(req => optimizedFetch<T>(req))
        );
        
        // Store results in the correct order
        batchResults.forEach((result, resultIndex) => {
          const originalIndex = index * batchSize + resultIndex;
          results[originalIndex] = result;
        });
        
        completedBatches++;
        
        if (completedBatches === batches.length) {
          resolve(results);
        }
      } catch (error) {
        reject(error);
      }
    });
  });
}
