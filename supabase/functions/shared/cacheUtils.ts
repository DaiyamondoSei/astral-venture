
/**
 * In-memory cache for edge functions
 * Provides a simple way to cache responses and reduce API calls
 */

// In-memory cache storage
const MEMORY_CACHE = new Map<string, {
  data: any;
  expiresAt: number;
  timestamp: number;
}>();

/**
 * Set a value in the memory cache
 * 
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in milliseconds
 */
export function setMemoryCacheValue<T>(
  key: string,
  value: T,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): void {
  MEMORY_CACHE.set(key, {
    data: value,
    expiresAt: Date.now() + ttl,
    timestamp: Date.now()
  });
}

/**
 * Get a value from the memory cache
 * 
 * @param key Cache key
 * @returns Cached value or undefined if not found or expired
 */
export function getMemoryCacheValue<T>(key: string): T | undefined {
  const cached = MEMORY_CACHE.get(key);
  
  if (!cached) {
    return undefined;
  }
  
  // Check if the cache entry has expired
  if (cached.expiresAt < Date.now()) {
    MEMORY_CACHE.delete(key);
    return undefined;
  }
  
  return cached.data as T;
}

/**
 * Delete a value from the memory cache
 * 
 * @param key Cache key
 * @returns True if the value was deleted, false if it wasn't found
 */
export function deleteMemoryCacheValue(key: string): boolean {
  return MEMORY_CACHE.delete(key);
}

/**
 * Clear all expired items from the cache
 * 
 * @returns Number of items cleared
 */
export function clearExpiredCache(): number {
  const now = Date.now();
  let cleared = 0;
  
  for (const [key, value] of MEMORY_CACHE.entries()) {
    if (value.expiresAt < now) {
      MEMORY_CACHE.delete(key);
      cleared++;
    }
  }
  
  return cleared;
}

/**
 * Clear all items from the cache
 * 
 * @returns Number of items cleared
 */
export function clearAllCache(): number {
  const size = MEMORY_CACHE.size;
  MEMORY_CACHE.clear();
  return size;
}

/**
 * Get the current cache size
 * 
 * @returns Number of items in the cache
 */
export function getCacheSize(): number {
  return MEMORY_CACHE.size;
}

/**
 * Get cache stats
 * 
 * @returns Cache statistics
 */
export function getCacheStats(): { 
  size: number; 
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  let oldestTimestamp: number | null = null;
  let newestTimestamp: number | null = null;
  
  for (const value of MEMORY_CACHE.values()) {
    if (oldestTimestamp === null || value.timestamp < oldestTimestamp) {
      oldestTimestamp = value.timestamp;
    }
    
    if (newestTimestamp === null || value.timestamp > newestTimestamp) {
      newestTimestamp = value.timestamp;
    }
  }
  
  return {
    size: MEMORY_CACHE.size,
    oldestEntry: oldestTimestamp,
    newestEntry: newestTimestamp
  };
}
