
// In-memory cache for responses
const memoryCache = new Map<string, { 
  data: Uint8Array, 
  timestamp: number,
  isStreaming: boolean
}>();

/**
 * Get a value from memory cache
 */
export function getFromMemoryCache(cacheKey: string): { 
  data: Uint8Array, 
  timestamp: number,
  isStreaming: boolean 
} | undefined {
  return memoryCache.get(cacheKey);
}

/**
 * Store a value in memory cache
 */
export function storeInMemoryCache(
  cacheKey: string, 
  data: Uint8Array, 
  isStreaming: boolean
): void {
  memoryCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    isStreaming
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
