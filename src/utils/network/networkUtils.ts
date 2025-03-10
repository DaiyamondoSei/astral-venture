
import { ApiError, ErrorCode } from '@/utils/api/apiErrorHandler';

interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cacheTtl?: number;
  cacheKey?: string;
  offlineMode?: 'queue' | 'reject' | 'fallback';
  fallbackData?: any;
}

interface CachedResponse<T> {
  data: T;
  timestamp: number;
  headers: Record<string, string>;
}

// Cache system
class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: any; expires: number }> = new Map();
  
  private constructor() {}
  
  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }
  
  public set<T>(key: string, data: T, ttlMs: number = 60000): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs
    });
  }
  
  public get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    if (cached.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }
  
  public has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  public delete(key: string): void {
    this.cache.delete(key);
  }
  
  public clear(): void {
    this.cache.clear();
  }
  
  public clearExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expires < now) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheManager = CacheManager.getInstance();

// Offline request queue
class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: Array<{
    url: string;
    options: RequestOptions;
    resolver: { resolve: Function; reject: Function };
  }> = [];
  private isOnline: boolean = navigator.onLine;
  private isProcessing: boolean = false;
  
  private constructor() {
    this.setupListeners();
  }
  
  public static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }
  
  private setupListeners(): void {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }
  
  private handleOnline(): void {
    this.isOnline = true;
    this.processQueue();
  }
  
  private handleOffline(): void {
    this.isOnline = false;
  }
  
  public isNetworkOnline(): boolean {
    return this.isOnline;
  }
  
  public enqueue<T>(url: string, options: RequestOptions): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        url,
        options,
        resolver: { resolve, reject }
      });
      
      if (this.isOnline && !this.isProcessing) {
        this.processQueue();
      }
    });
  }
  
  private async processQueue(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0 || this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.queue.length > 0 && this.isOnline) {
      const request = this.queue.shift();
      if (!request) continue;
      
      try {
        const { url, options, resolver } = request;
        const response = await enhancedFetch(url, {
          ...options,
          offlineMode: 'reject' // Prevent infinite loop
        });
        resolver.resolve(response);
      } catch (error) {
        request.resolver.reject(error);
      }
    }
    
    this.isProcessing = false;
  }
  
  public clearQueue(): void {
    const queueCopy = [...this.queue];
    this.queue = [];
    
    // Reject all pending requests
    queueCopy.forEach(request => {
      request.resolver.reject(ApiError.network('Request cleared from offline queue'));
    });
  }
  
  public getQueueLength(): number {
    return this.queue.length;
  }
}

export const offlineQueue = OfflineQueue.getInstance();

/**
 * Timeout mechanism for fetch
 */
function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number }): Promise<Response> {
  const { timeout = 15000, ...fetchOptions } = options;
  
  // Set up AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  return fetch(url, {
    ...fetchOptions,
    signal: controller.signal
  })
    .finally(() => clearTimeout(timeoutId));
}

/**
 * Enhanced fetch with additional features
 */
export async function enhancedFetch<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    timeout = 15000,
    retries = 1,
    retryDelay = 1000,
    cacheTtl,
    cacheKey = url,
    offlineMode = 'queue',
    fallbackData,
    ...fetchOptions
  } = options;
  
  // Check for network connectivity
  if (!offlineQueue.isNetworkOnline()) {
    switch (offlineMode) {
      case 'queue':
        return offlineQueue.enqueue<T>(url, options);
      case 'fallback':
        if (cacheTtl && cacheKey) {
          const cachedData = cacheManager.get<T>(cacheKey);
          if (cachedData) {
            return cachedData;
          }
        }
        if (fallbackData !== undefined) {
          return fallbackData;
        }
        // Fall through to reject if no fallback
      case 'reject':
      default:
        throw ApiError.network('Network connection unavailable');
    }
  }
  
  // Check cache first if caching is enabled
  if (cacheTtl && cacheKey && ['GET', undefined].includes(fetchOptions.method)) {
    const cachedData = cacheManager.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }
  
  // Retry mechanism
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Wait before retrying
      if (attempt > 0 && retryDelay) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
      
      // Fetch with timeout
      const response = await fetchWithTimeout(url, {
        ...fetchOptions,
        timeout
      });
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        let errorData: any;
        
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        throw new ApiError(
          errorData.message || errorData.error || `Request failed with status ${response.status}`,
          response.status === 401 ? ErrorCode.AUTHENTICATION_ERROR :
          response.status === 400 ? ErrorCode.VALIDATION_FAILED :
          response.status === 429 ? ErrorCode.RATE_LIMITED :
          response.status >= 500 ? ErrorCode.INTERNAL_ERROR :
          ErrorCode.UNDEFINED,
          {
            statusCode: response.status,
            details: errorData,
            shouldRetry: response.status >= 500 || response.status === 429
          }
        );
      }
      
      // Process successful response
      let result: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        result = await response.json();
      } else if (response.status === 204) {
        result = null as unknown as T;
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        try {
          result = JSON.parse(text) as T;
        } catch (e) {
          result = text as unknown as T;
        }
      }
      
      // Cache result if caching is enabled
      if (cacheTtl && cacheKey && ['GET', undefined].includes(fetchOptions.method)) {
        cacheManager.set(cacheKey, result, cacheTtl);
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if error is not retriable or we've reached max retries
      if (
        error instanceof ApiError && 
        !error.shouldRetry || 
        attempt === retries
      ) {
        break;
      }
      
      console.warn(`Request failed (attempt ${attempt + 1}/${retries + 1}):`, error);
    }
  }
  
  // All retries failed
  if (lastError instanceof ApiError) {
    throw lastError;
  } else if (lastError instanceof DOMException && lastError.name === 'AbortError') {
    throw ApiError.timeout();
  } else {
    throw ApiError.fromError(lastError);
  }
}

/**
 * Check if the client is online
 */
export function isOnline(): boolean {
  return offlineQueue.isNetworkOnline();
}

/**
 * Clear the cache
 */
export function clearCache(pattern?: string | RegExp): void {
  cacheManager.clear();
}

/**
 * Invalidate a specific cache entry
 */
export function invalidateCache(key: string): void {
  cacheManager.delete(key);
}

export default {
  enhancedFetch,
  isOnline,
  clearCache,
  invalidateCache,
  cacheManager,
  offlineQueue
};
