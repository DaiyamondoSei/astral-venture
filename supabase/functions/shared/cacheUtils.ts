
/**
 * Shared Caching Utilities for Edge Functions
 */
import { logEvent } from "./responseUtils.ts";
import { getSupabaseAdmin } from "./authUtils.ts";

// In-memory cache with TTL
const memoryCache = new Map<string, {
  data: any;
  expiresAt: number;
}>();

// Default TTL in milliseconds
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Set a value in the in-memory cache
 */
export function setMemoryCacheValue(
  key: string,
  value: any,
  ttlMs: number = DEFAULT_TTL
): void {
  memoryCache.set(key, {
    data: value,
    expiresAt: Date.now() + ttlMs
  });
}

/**
 * Get a value from the in-memory cache
 */
export function getMemoryCacheValue<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  
  if (!cached) return null;
  
  // Check if expired
  if (Date.now() > cached.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

/**
 * Delete a value from the in-memory cache
 */
export function deleteMemoryCacheValue(key: string): boolean {
  return memoryCache.delete(key);
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): number {
  let clearedCount = 0;
  const now = Date.now();
  
  for (const [key, value] of memoryCache.entries()) {
    if (now > value.expiresAt) {
      memoryCache.delete(key);
      clearedCount++;
    }
  }
  
  return clearedCount;
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): number {
  const size = memoryCache.size;
  memoryCache.clear();
  return size;
}

/**
 * Cache a function result with a cache key generator
 */
export async function withCache<T>(
  cacheKeyOrGenerator: string | ((...args: any[]) => string),
  fn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL,
  ...args: any[]
): Promise<T> {
  const cacheKey = typeof cacheKeyOrGenerator === 'function'
    ? cacheKeyOrGenerator(...args)
    : cacheKeyOrGenerator;
  
  // Try to get from cache first
  const cachedValue = getMemoryCacheValue<T>(cacheKey);
  if (cachedValue !== null) {
    logEvent("debug", `Cache hit for key: ${cacheKey}`);
    return cachedValue;
  }
  
  // Execute the function
  logEvent("debug", `Cache miss for key: ${cacheKey}`);
  const result = await fn();
  
  // Cache the result
  setMemoryCacheValue(cacheKey, result, ttlMs);
  
  return result;
}

/**
 * Store a cache item in the database
 */
export async function setDatabaseCache(
  key: string,
  value: any,
  ttlSeconds: number = 300
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    
    const { error } = await supabase
      .from('cache')
      .upsert({
        key,
        value: JSON.stringify(value),
        expires_at: expiresAt
      });
    
    if (error) {
      logEvent("error", "Error storing in database cache", { error, key });
      return false;
    }
    
    return true;
  } catch (error) {
    logEvent("error", "Exception storing in database cache", { error, key });
    return false;
  }
}

/**
 * Get a cache item from the database
 */
export async function getDatabaseCache<T>(key: string): Promise<T | null> {
  try {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('cache')
      .select('value')
      .eq('key', key)
      .gt('expires_at', now)
      .maybeSingle();
    
    if (error || !data) {
      return null;
    }
    
    return JSON.parse(data.value) as T;
  } catch (error) {
    logEvent("error", "Error retrieving from database cache", { error, key });
    return null;
  }
}

/**
 * Delete expired cache items from database
 */
export async function cleanDatabaseCache(): Promise<number> {
  try {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    
    const { count, error } = await supabase
      .from('cache')
      .delete()
      .lt('expires_at', now)
      .select('count');
    
    if (error) {
      logEvent("error", "Error cleaning database cache", { error });
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    logEvent("error", "Exception cleaning database cache", { error });
    return 0;
  }
}
