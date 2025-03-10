
/**
 * Cache handling utilities for AI query responses
 */

import { corsHeaders } from "../../shared/responseUtils.ts";
import { 
  setMemoryCacheValue, 
  getMemoryCacheValue, 
  clearExpiredCache, 
  clearAllCache 
} from "../../shared/cacheUtils.ts";

// Cache TTL in milliseconds (default: 30 minutes)
const DEFAULT_CACHE_TTL = 30 * 60 * 1000;

/**
 * Get a cached response if available
 * 
 * @param key - Cache key
 * @param isStream - Whether the response is a stream
 * @returns Cached response or null
 */
export async function getCachedResponse(
  key: string,
  isStream = false
): Promise<Response | null> {
  const cached = getMemoryCacheValue<{
    response: Response;
    isStream: boolean;
  }>(key);
  
  if (!cached) {
    return null;
  }
  
  // We can't use streams if the types don't match
  if (cached.isStream !== isStream) {
    return null;
  }
  
  // Clone the response for streaming or non-streaming cases
  if (cached.isStream) {
    // For streaming responses, we need special handling
    const { readable, writable } = new TransformStream();
    cached.response.body?.pipeTo(writable);
    
    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream"
      }
    });
  }
  
  // For regular responses, we can just clone
  return cached.response.clone();
}

/**
 * Cache a response for future use
 * 
 * @param key - Cache key
 * @param response - Response to cache
 * @param isStream - Whether the response is a stream
 * @param ttl - Cache time-to-live in milliseconds
 */
export async function cacheResponse(
  key: string,
  response: Response,
  isStream = false,
  ttl = DEFAULT_CACHE_TTL
): Promise<void> {
  setMemoryCacheValue(key, {
    response: response.clone(),
    isStream
  }, ttl);
}

/**
 * Clean up expired cache entries
 * 
 * @param force - Whether to force clear all cache entries
 * @returns Number of cache entries cleared
 */
export async function cleanupCache(force = false): Promise<number> {
  if (force) {
    return clearAllCache();
  }
  
  return clearExpiredCache();
}
