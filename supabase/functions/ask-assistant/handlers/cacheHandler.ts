
/**
 * Handler for response caching
 */

import { 
  setMemoryCacheValue, 
  getMemoryCacheValue, 
  clearAllCache, 
  clearExpiredCache 
} from "../../shared/cacheUtils.ts";
import { logEvent } from "../../shared/responseUtils.ts";

/**
 * Get a cached response if available
 * 
 * @param cacheKey Cache key
 * @param isStreaming Whether the response is streaming
 * @returns Cached response or undefined
 */
export async function getCachedResponse(
  cacheKey: string,
  isStreaming: boolean
): Promise<Response | undefined> {
  try {
    const cached = getMemoryCacheValue<{
      data: Uint8Array,
      timestamp: number,
      isStreaming: boolean
    }>(cacheKey);
    
    if (!cached) {
      return undefined;
    }
    
    // Handle streaming and non-streaming responses differently
    if (cached.isStreaming !== isStreaming) {
      logEvent("debug", "Cache hit but format mismatch", { 
        cacheKey, 
        cached: "streaming", 
        requested: isStreaming ? "streaming" : "standard" 
      });
      
      return undefined;
    }
    
    logEvent("info", "Cache hit", { 
      cacheKey, 
      ageMs: Date.now() - cached.timestamp,
      isStreaming
    });
    
    // Construct appropriate headers
    const headers = isStreaming ? {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    } : {
      "Content-Type": "application/json",
      "Cache-Control": "private, max-age=600"
    };
    
    // Create a new response from the cached data
    return new Response(cached.data, { headers });
  } catch (error) {
    logEvent("error", "Error retrieving cached response", {
      error: error instanceof Error ? error.message : String(error),
      cacheKey
    });
    
    return undefined;
  }
}

/**
 * Cache a response for future use
 * 
 * @param cacheKey Cache key
 * @param response Response to cache
 * @param isStreaming Whether the response is streaming
 */
export async function cacheResponse(
  cacheKey: string,
  response: Response,
  isStreaming: boolean
): Promise<void> {
  try {
    const responseData = await response.arrayBuffer();
    
    // Cache the response data
    setMemoryCacheValue(
      cacheKey,
      {
        data: new Uint8Array(responseData),
        timestamp: Date.now(),
        isStreaming
      },
      30 * 60 * 1000 // 30 minute TTL
    );
    
    logEvent("debug", "Response cached", { cacheKey, isStreaming });
  } catch (error) {
    logEvent("error", "Error caching response", {
      error: error instanceof Error ? error.message : String(error),
      cacheKey
    });
  }
}

/**
 * Clean up the cache
 * 
 * @param clearAll Whether to clear all cache entries or just expired ones
 * @returns Number of entries cleared
 */
export async function cleanupCache(clearAll: boolean = false): Promise<number> {
  try {
    const clearedCount = clearAll ? clearAllCache() : clearExpiredCache();
    
    logEvent("info", `Cache cleanup completed`, {
      clearedEntries: clearedCount,
      fullCleanup: clearAll
    });
    
    return clearedCount;
  } catch (error) {
    logEvent("error", "Error cleaning up cache", {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return 0;
  }
}
