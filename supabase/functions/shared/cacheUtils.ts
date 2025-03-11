
/**
 * Shared caching utilities for Edge Functions
 */

// Cache key creation
export function createCacheKey(
  ...parts: Array<string | number | boolean | null | undefined>
): string {
  // Filter out null and undefined values
  const validParts = parts.filter(part => part !== null && part !== undefined);
  
  // Join parts with a separator that won't appear in the parts
  return validParts.join('::');
}

// Cache key prefix by function
export const CACHE_PREFIXES = {
  ASK_ASSISTANT: 'ask-assistant:',
  PROCESS_AI_QUERY: 'process-ai-query:',
  TRACK_PERFORMANCE: 'track-performance:',
  GET_NAVIGATION_NODES: 'get-navigation-nodes:'
};

/**
 * Parse and normalize a cache key
 * 
 * @param key The cache key to parse
 * @param defaultPrefix The default prefix to use if none is present
 * @returns Normalized cache key with proper prefix
 */
export function normalizeCacheKey(key: string, defaultPrefix: string): string {
  // Check if key already has a known prefix
  const hasPrefix = Object.values(CACHE_PREFIXES).some(prefix => 
    key.startsWith(prefix)
  );
  
  // If no prefix, add the default one
  if (!hasPrefix) {
    return `${defaultPrefix}${key}`;
  }
  
  return key;
}

/**
 * Generate a cache key based on request parameters
 * 
 * @param params Request parameters
 * @param prefix Cache key prefix
 * @returns Cache key
 */
export function generateCacheKey(
  params: Record<string, any>,
  prefix: string
): string {
  // Get stable keys sorted alphabetically
  const keys = Object.keys(params).sort();
  
  // Build parameter string
  const paramString = keys
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => {
      const value = params[key];
      return `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`;
    })
    .join('&');
  
  // Combine prefix and parameters
  return `${prefix}${paramString}`;
}

/**
 * Generate a consistent hash from a string
 * 
 * @param str String to hash
 * @returns Hash string
 */
export function generateHash(str: string): string {
  let hash = 0;
  
  if (str.length === 0) {
    return hash.toString(16);
  }
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Creates a partitioned cache key to distribute cache across buckets
 * 
 * @param key Original cache key
 * @param buckets Number of buckets
 * @returns Partitioned cache key
 */
export function createPartitionedCacheKey(key: string, buckets: number = 16): string {
  const hash = generateHash(key);
  const bucket = parseInt(hash.substring(0, 2), 16) % buckets;
  return `bucket${bucket}:${key}`;
}

/**
 * Simple in-memory cache implementation with expiration
 */
export class MemoryCache {
  private cache: Map<string, { value: any, expires: number }> = new Map();
  
  /**
   * Set a value in the cache
   * 
   * @param key Cache key
   * @param value Value to store
   * @param ttlMs Time to live in milliseconds
   */
  set(key: string, value: any, ttlMs: number = 60000): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlMs
    });
  }
  
  /**
   * Get a value from the cache
   * 
   * @param key Cache key
   * @returns Cached value or null if not found or expired
   */
  get(key: string): any {
    const item = this.cache.get(key);
    
    // Return null if item doesn't exist
    if (!item) return null;
    
    // Return null if item has expired
    if (item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  /**
   * Delete a value from the cache
   * 
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all expired items from the cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expires < now) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Get an item from cache or compute it if not found
   * 
   * @param key Cache key
   * @param producer Function to produce the value if not in cache
   * @param ttlMs Time to live in milliseconds
   * @returns Value from cache or computed value
   */
  async getOrSet<T>(
    key: string, 
    producer: () => Promise<T>,
    ttlMs: number = 60000
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get(key);
    if (cached !== null) {
      return cached as T;
    }
    
    // If not in cache, compute the value
    const value = await producer();
    
    // Store in cache
    this.set(key, value, ttlMs);
    
    return value;
  }
}

// Export a singleton instance for common use
export const globalCache = new MemoryCache();
