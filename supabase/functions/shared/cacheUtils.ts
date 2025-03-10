
/**
 * Shared cache utilities for Edge Functions
 */

// In-memory cache for development (in production, this would use KV or Redis)
const memoryCache = new Map<string, {
  value: any;
  timestamp: number;
  ttl: number;
}>();

/**
 * Create a cache key based on the query and optional context
 * 
 * @param query - The query string
 * @param context - Optional context data
 * @param model - Optional AI model name
 * @returns A deterministic cache key
 */
export function createCacheKey(
  query: string,
  context: any | null = null,
  model = "default"
): string {
  // Create a normalized string representation
  const queryNormalized = query.trim().toLowerCase();
  const contextString = context ? JSON.stringify(context) : "";
  
  // Combine the elements
  const combined = `${model}:${queryNormalized}:${contextString}`;
  
  // Create a simple hash for shorter keys
  // In production, use a more robust hashing algorithm
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `${model}_${hash}`;
}

/**
 * Check if a cache key is valid
 * 
 * @param key - The cache key to validate
 * @returns Whether the key is valid
 */
export function isValidCacheKey(key: string): boolean {
  // Basic validation to prevent injection or other issues
  return /^[a-zA-Z0-9_-]+$/.test(key);
}

/**
 * Store a value in the memory cache
 * 
 * @param key - Cache key
 * @param value - Value to store
 * @param ttl - Time to live in milliseconds
 * @returns Success status
 */
export function setMemoryCacheValue<T>(
  key: string,
  value: T,
  ttl = 30 * 60 * 1000 // 30 minutes by default
): boolean {
  try {
    if (!isValidCacheKey(key)) {
      console.warn(`Invalid cache key: ${key}`);
      return false;
    }
    
    memoryCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
    
    return true;
  } catch (error) {
    console.error("Error setting cache value:", error);
    return false;
  }
}

/**
 * Retrieve a value from the memory cache
 * 
 * @param key - Cache key
 * @returns Cached value or null if not found or expired
 */
export function getMemoryCacheValue<T>(key: string): T | null {
  try {
    if (!isValidCacheKey(key)) {
      console.warn(`Invalid cache key: ${key}`);
      return null;
    }
    
    const cached = memoryCache.get(key);
    if (!cached) {
      return null;
    }
    
    // Check if expired
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      memoryCache.delete(key);
      return null;
    }
    
    return cached.value as T;
  } catch (error) {
    console.error("Error getting cache value:", error);
    return null;
  }
}

/**
 * Clear all expired cache entries
 * 
 * @returns Number of expired entries cleared
 */
export function clearExpiredCache(): number {
  try {
    const now = Date.now();
    let clearedCount = 0;
    
    for (const [key, entry] of memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        memoryCache.delete(key);
        clearedCount++;
      }
    }
    
    return clearedCount;
  } catch (error) {
    console.error("Error clearing expired cache:", error);
    return 0;
  }
}

/**
 * Clear all cache entries
 * 
 * @returns Number of entries cleared
 */
export function clearAllCache(): number {
  try {
    const size = memoryCache.size;
    memoryCache.clear();
    return size;
  } catch (error) {
    console.error("Error clearing all cache:", error);
    return 0;
  }
}

/**
 * Generate a cache key for user-specific content
 * 
 * @param userId - User ID
 * @param action - Action type
 * @param identifier - Optional unique identifier
 * @returns User-specific cache key
 */
export function createUserCacheKey(
  userId: string,
  action: string,
  identifier?: string
): string {
  const idPart = identifier ? `:${identifier}` : '';
  return `user:${userId}:${action}${idPart}`;
}

/**
 * Extract metadata from cache key
 * 
 * @param key - Cache key to parse
 * @returns Extracted metadata
 */
export function parseCacheKey(key: string): {
  model?: string;
  hash?: string;
  userId?: string;
  action?: string;
} {
  // Parse model_hash format
  const modelMatch = key.match(/^([a-zA-Z0-9_-]+)_(-?\d+)$/);
  if (modelMatch) {
    return {
      model: modelMatch[1],
      hash: modelMatch[2],
    };
  }
  
  // Parse user:userId:action format
  const userMatch = key.match(/^user:([a-zA-Z0-9_-]+):([a-zA-Z0-9_-]+)/);
  if (userMatch) {
    return {
      userId: userMatch[1],
      action: userMatch[2],
    };
  }
  
  return {};
}
