
import { 
  setMemoryCacheValue, 
  getMemoryCacheValue, 
  clearExpiredCache,
  clearAllCache,
  deleteMemoryCacheValue
} from "../../../shared/cacheUtils.ts";
import { logEvent } from "../../../shared/responseUtils.ts";

// Default cache configuration
const DEFAULT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Get a value from memory cache
 */
export function getFromMemoryCache(cacheKey: string): { 
  data: Uint8Array, 
  timestamp: number,
  isStreaming: boolean 
} | undefined {
  const cacheItem = getMemoryCacheValue<{
    data: Uint8Array,
    timestamp: number,
    isStreaming: boolean,
    expiresAt: number
  }>(cacheKey);
  
  if (!cacheItem) return undefined;
  
  return {
    data: cacheItem.data,
    timestamp: cacheItem.timestamp,
    isStreaming: cacheItem.isStreaming
  };
}

/**
 * Store a value in memory cache
 */
export function storeInMemoryCache(
  cacheKey: string, 
  data: Uint8Array, 
  isStreaming: boolean,
  ttl = DEFAULT_CACHE_TTL
): void {
  setMemoryCacheValue(
    cacheKey, 
    {
      data,
      timestamp: Date.now(),
      isStreaming,
      expiresAt: Date.now() + ttl
    }, 
    ttl
  );
  
  logEvent("debug", "Added to memory cache", { 
    cacheKey, 
    isStreaming, 
    ttl 
  });
}

/**
 * Delete a value from memory cache
 */
export function deleteFromMemoryCache(cacheKey: string): boolean {
  return deleteMemoryCacheValue(cacheKey);
}

/**
 * Clear all items from memory cache
 */
export function clearMemoryCache(): number {
  return clearAllCache();
}

/**
 * Get the size of the memory cache
 */
export function getMemoryCacheSize(): number {
  // This is an estimation as we need to implement a size tracker
  // in the shared cacheUtils module
  return 0;
}

/**
 * Clear expired items from the cache
 */
export function clearExpiredItems(): number {
  return clearExpiredCache();
}
