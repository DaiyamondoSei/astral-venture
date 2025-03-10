
/**
 * Shared caching utilities for Edge Functions
 */

// Default cache TTL (30 minutes)
const DEFAULT_CACHE_TTL = 30 * 60 * 1000;

/**
 * Create a cache key from input parameters
 */
export function createCacheKey(
  query: string,
  context?: string | null,
  model?: string
): string {
  // Normalize inputs for consistent keys
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedContext = context ? context.trim().toLowerCase() : '';
  const normalizedModel = model || 'default';
  
  // Create a composite key
  const compositeKey = `${normalizedModel}:${normalizedQuery}:${normalizedContext}`;
  
  // Use a hash function for shorter keys
  // Simple hash implementation that's good enough for caching
  let hash = 0;
  for (let i = 0; i < compositeKey.length; i++) {
    const char = compositeKey.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `cache:${Math.abs(hash).toString(16)}`;
}

/**
 * Store a value in the KV store with expiration
 */
export async function setCacheValue(
  key: string,
  value: any,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<void> {
  try {
    // Add expiration timestamp
    const expiresAt = Date.now() + ttl;
    const cacheObject = {
      value,
      expiresAt
    };
    
    // Store serialized value
    await Deno.env.get("SUPABASE_KV")?.set(key, JSON.stringify(cacheObject));
  } catch (error) {
    console.error("Cache set error:", error);
    // Fail silently - caching errors shouldn't break functionality
  }
}

/**
 * Retrieve a value from the KV store, checking expiration
 */
export async function getCacheValue<T>(key: string): Promise<T | null> {
  try {
    // Get value from KV store
    const cachedData = await Deno.env.get("SUPABASE_KV")?.get<string>(key);
    
    if (!cachedData) {
      return null;
    }
    
    // Parse the cache object
    const cacheObject = JSON.parse(cachedData);
    
    // Check if value has expired
    if (cacheObject.expiresAt && cacheObject.expiresAt < Date.now()) {
      // Expired, remove from cache
      await Deno.env.get("SUPABASE_KV")?.delete(key);
      return null;
    }
    
    return cacheObject.value as T;
  } catch (error) {
    console.error("Cache get error:", error);
    // Fail silently - caching errors shouldn't break functionality
    return null;
  }
}

/**
 * Remove a value from the KV store
 */
export async function deleteCacheValue(key: string): Promise<void> {
  try {
    await Deno.env.get("SUPABASE_KV")?.delete(key);
  } catch (error) {
    console.error("Cache delete error:", error);
    // Fail silently - caching errors shouldn't break functionality
  }
}

/**
 * Clear all keys with a specific prefix
 */
export async function clearCacheByPrefix(prefix: string): Promise<void> {
  try {
    const kv = Deno.env.get("SUPABASE_KV");
    if (!kv) return;
    
    // List all keys with the prefix
    const keys = await kv.list({ prefix });
    
    // Delete each key
    for await (const key of keys) {
      await kv.delete(key.key);
    }
  } catch (error) {
    console.error("Cache clear error:", error);
    // Fail silently - caching errors shouldn't break functionality
  }
}
