
/**
 * Shared caching utilities for edge functions
 */

// In-memory cache for edge functions
const MEMORY_CACHE = new Map<string, any>();

/**
 * Creates a consistent cache key from input parameters
 */
export function createCacheKey(
  mainInput: string,
  context?: string | null,
  model?: string
): string {
  const normalizedInput = mainInput.trim().toLowerCase();
  const contextHash = context ? hashString(context) : "no-context";
  const modelStr = model || "default-model";
  
  return `${normalizedInput.substring(0, 50)}-${contextHash}-${modelStr}`;
}

/**
 * Simple string hashing function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Get a value from the memory cache
 */
export function getMemoryCacheValue<T>(key: string): T | undefined {
  const item = MEMORY_CACHE.get(key);
  
  if (!item) return undefined;
  
  // Check if expired
  if (item.expiresAt && item.expiresAt < Date.now()) {
    MEMORY_CACHE.delete(key);
    return undefined;
  }
  
  return item as T;
}

/**
 * Set a value in the memory cache with optional TTL
 */
export function setMemoryCacheValue<T>(
  key: string,
  value: T,
  ttlMs: number = 30 * 60 * 1000 // 30 minutes default
): void {
  MEMORY_CACHE.set(key, {
    ...value,
    expiresAt: Date.now() + ttlMs
  });
}

/**
 * Delete a specific cache entry
 */
export function deleteMemoryCacheValue(key: string): boolean {
  return MEMORY_CACHE.delete(key);
}

/**
 * Clear all expired items from the cache
 */
export function clearExpiredCache(): number {
  let deletedCount = 0;
  const now = Date.now();
  
  for (const [key, value] of MEMORY_CACHE.entries()) {
    if (value.expiresAt && value.expiresAt < now) {
      MEMORY_CACHE.delete(key);
      deletedCount++;
    }
  }
  
  return deletedCount;
}

/**
 * Clear the entire cache
 */
export function clearAllCache(): number {
  const size = MEMORY_CACHE.size;
  MEMORY_CACHE.clear();
  return size;
}
