
/**
 * Cache handling utilities for AI responses
 */

import { logEvent } from "../../shared/responseUtils.ts";
import { 
  setMemoryCacheValue, 
  getMemoryCacheValue, 
  clearExpiredCache,
  clearAllCache
} from "../../shared/cacheUtils.ts";

// Cache management constants
const DEFAULT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Get a cached response if available
 * 
 * @param cacheKey - The cache key
 * @param isStreamingRequest - Whether the request expects a streaming response
 * @returns Cached response or null
 */
export async function getCachedResponse(
  cacheKey: string, 
  isStreamingRequest: boolean
): Promise<Response | null> {
  const cached = getMemoryCacheValue<{
    response: Response,
    isStreamingResponse: boolean
  }>(cacheKey);
  
  // Only use cache if it matches the request type (streaming vs non-streaming)
  if (cached && cached.isStreamingResponse === isStreamingRequest) {
    logEvent("info", "Cache hit", { cacheKey, isStreamingRequest });
    return cached.response.clone(); // Return a clone of the cached response
  }
  
  return null;
}

/**
 * Cache a response for future use
 * 
 * @param cacheKey - The cache key
 * @param response - The response to cache
 * @param isStreamingResponse - Whether this is a streaming response
 * @param ttl - Time-to-live in milliseconds
 */
export async function cacheResponse(
  cacheKey: string, 
  response: Response, 
  isStreamingResponse: boolean,
  ttl = DEFAULT_CACHE_TTL
): Promise<void> {
  // Clean up cache first
  await cleanupCache();
  
  setMemoryCacheValue(cacheKey, {
    response: response.clone(),
    isStreamingResponse
  }, ttl);
  
  logEvent("info", "Added response to cache", { 
    cacheKey, 
    isStreamingResponse, 
    ttl 
  });
}

/**
 * Clean up expired cache entries and maintain cache size limits
 * 
 * @param forceCleanAll - Whether to force clean all entries
 * @returns Number of entries cleared
 */
export async function cleanupCache(forceCleanAll = false): Promise<number> {
  if (forceCleanAll) {
    const size = clearAllCache();
    logEvent("info", "Cleared all cache entries", { count: size });
    return size;
  }
  
  const deletionCount = clearExpiredCache();
  
  if (deletionCount > 0) {
    logEvent("info", "Cleaned up expired cache entries", { count: deletionCount });
  }
  
  return deletionCount;
}
