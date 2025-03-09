
// In-memory cache for responses with expiration and size limits
const memoryCache = new Map<string, { 
  data: Uint8Array, 
  timestamp: number,
  isStreaming: boolean,
  expiresAt: number
}>();

// Default cache configuration
const DEFAULT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds
const MAX_CACHE_SIZE = 100; // Maximum number of items in cache

/**
 * Get a value from memory cache
 */
export function getFromMemoryCache(cacheKey: string): { 
  data: Uint8Array, 
  timestamp: number,
  isStreaming: boolean 
} | undefined {
  const cacheItem = memoryCache.get(cacheKey);
  
  if (!cacheItem) return undefined;
  
  // Check if the item has expired
  if (Date.now() > cacheItem.expiresAt) {
    memoryCache.delete(cacheKey);
    return undefined;
  }
  
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
  ttl: number = DEFAULT_CACHE_TTL
): void {
  // If cache is at max size, remove oldest item
  if (memoryCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = findOldestCacheKey();
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  
  memoryCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    isStreaming,
    expiresAt: Date.now() + ttl
  });
}

/**
 * Delete a value from memory cache
 */
export function deleteFromMemoryCache(cacheKey: string): boolean {
  return memoryCache.delete(cacheKey);
}

/**
 * Clear all items from memory cache
 */
export function clearMemoryCache(): number {
  const size = memoryCache.size;
  memoryCache.clear();
  return size;
}

/**
 * Get the size of the memory cache
 */
export function getMemoryCacheSize(): number {
  return memoryCache.size;
}

/**
 * Find the oldest key in the cache
 */
function findOldestCacheKey(): string | undefined {
  let oldestKey: string | undefined;
  let oldestTimestamp = Infinity;
  
  for (const [key, value] of memoryCache.entries()) {
    if (value.timestamp < oldestTimestamp) {
      oldestTimestamp = value.timestamp;
      oldestKey = key;
    }
  }
  
  return oldestKey;
}

/**
 * Clear expired items from the cache
 */
export function clearExpiredItems(): number {
  const now = Date.now();
  let removedCount = 0;
  
  for (const [key, value] of memoryCache.entries()) {
    if (now > value.expiresAt) {
      memoryCache.delete(key);
      removedCount++;
    }
  }
  
  return removedCount;
}
