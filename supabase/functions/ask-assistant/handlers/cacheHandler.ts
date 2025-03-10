
/**
 * Cache handler for AI responses
 */

import { corsHeaders } from "../../shared/responseUtils.ts";
import { 
  getMemoryCacheValue, 
  setMemoryCacheValue,
  clearAllCache,
  clearExpiredCache
} from "../../shared/cacheUtils.ts";

interface CachedResponse {
  body: Uint8Array;
  isStream: boolean;
  timestamp: number;
}

/**
 * Get a cached response if available
 * 
 * @param cacheKey The cache key
 * @param isStream Whether the response is a stream
 * @returns Cached response or null
 */
export async function getCachedResponse(
  cacheKey: string, 
  isStream: boolean
): Promise<Response | null> {
  const cached = getMemoryCacheValue<CachedResponse>(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  console.log(`Retrieved cached response for key: ${cacheKey}`);
  
  // Create appropriate headers based on response type
  const headers = {
    ...corsHeaders,
    "Content-Type": isStream ? "text/event-stream" : "application/json",
    "Cache-Control": "no-cache",
    "X-Cache": "HIT",
    "X-Cache-Timestamp": new Date(cached.timestamp).toISOString()
  };
  
  // Return cached response
  return new Response(cached.body, { headers });
}

/**
 * Cache a response for future use
 * 
 * @param cacheKey The cache key
 * @param response The response to cache
 * @param isStream Whether the response is a stream
 * @param ttlMs Optional TTL in milliseconds
 */
export async function cacheResponse(
  cacheKey: string, 
  response: Response,
  isStream: boolean,
  ttlMs: number = 30 * 60 * 1000 // 30 minutes default
): Promise<void> {
  try {
    // Clone the response to avoid consuming it
    const clonedResponse = response.clone();
    
    // Get the response body as a Uint8Array
    const body = new Uint8Array(await clonedResponse.arrayBuffer());
    
    // Store in cache
    setMemoryCacheValue<CachedResponse>(
      cacheKey,
      {
        body,
        isStream,
        timestamp: Date.now()
      },
      ttlMs
    );
    
    console.log(`Cached response for key: ${cacheKey}`);
  } catch (error) {
    console.error(`Error caching response:`, error);
  }
}

/**
 * Clean up the cache
 * 
 * @param clearAll Whether to clear all cache or just expired items
 * @returns Number of items cleared
 */
export async function cleanupCache(clearAll: boolean = false): Promise<number> {
  if (clearAll) {
    return clearAllCache();
  }
  
  return clearExpiredCache();
}
