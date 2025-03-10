
/**
 * Shared cache utilities for Edge Functions
 */

import { logEvent } from "./responseUtils.ts";

/**
 * Create a deterministic cache key from request parameters
 */
export function createCacheKey(
  primaryValue: string,
  secondaryValue?: string,
  prefix = "cache"
): string {
  // Use crypto to create a deterministic hash
  let input = primaryValue;
  
  if (secondaryValue) {
    input += `:${secondaryValue}`;
  }
  
  // Create a simple hash using String.charCodeAt
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Return a prefixed hash string
  return `${prefix}:${Math.abs(hash).toString(16)}`;
}

/**
 * Cache an item with time-to-live
 */
export async function cacheItem<T>(
  key: string, 
  value: T, 
  ttlSeconds = 300, // 5 minutes default
  kvNamespace?: Deno.Kv
): Promise<boolean> {
  try {
    // Return early if no KV namespace and not in Deno environment
    if (!kvNamespace && typeof Deno?.openKv !== "function") {
      logEvent("warn", "Cache not available", { key });
      return false;
    }
    
    // Use provided KV namespace or open a new one
    const kv = kvNamespace || await Deno.openKv();
    
    // Calculate expiry
    const expireAt = new Date();
    expireAt.setSeconds(expireAt.getSeconds() + ttlSeconds);
    
    // Store value with expiration
    await kv.set([key], value, { expireAt });
    
    // Close KV if we opened it
    if (!kvNamespace) {
      kv.close();
    }
    
    return true;
  } catch (error) {
    logEvent("error", "Cache write error", { key, error: error.message });
    return false;
  }
}

/**
 * Retrieve an item from cache
 */
export async function getCachedItem<T>(
  key: string,
  kvNamespace?: Deno.Kv
): Promise<T | null> {
  try {
    // Return null if no KV namespace and not in Deno environment
    if (!kvNamespace && typeof Deno?.openKv !== "function") {
      return null;
    }
    
    // Use provided KV namespace or open a new one
    const kv = kvNamespace || await Deno.openKv();
    
    // Get value from cache
    const result = await kv.get<T>([key]);
    
    // Close KV if we opened it
    if (!kvNamespace) {
      kv.close();
    }
    
    return result.value;
  } catch (error) {
    logEvent("error", "Cache read error", { key, error: error.message });
    return null;
  }
}

/**
 * Delete an item from cache
 */
export async function deleteCachedItem(
  key: string,
  kvNamespace?: Deno.Kv
): Promise<boolean> {
  try {
    // Return false if no KV namespace and not in Deno environment
    if (!kvNamespace && typeof Deno?.openKv !== "function") {
      return false;
    }
    
    // Use provided KV namespace or open a new one
    const kv = kvNamespace || await Deno.openKv();
    
    // Delete value from cache
    await kv.delete([key]);
    
    // Close KV if we opened it
    if (!kvNamespace) {
      kv.close();
    }
    
    return true;
  } catch (error) {
    logEvent("error", "Cache delete error", { key, error: error.message });
    return false;
  }
}
