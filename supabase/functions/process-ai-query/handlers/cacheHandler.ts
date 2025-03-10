
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
import { logEvent } from "../../shared/responseUtils.ts";

// Cache TTL in milliseconds (default: 30 minutes)
const DEFAULT_CACHE_TTL = 30 * 60 * 1000;

// Type for cached response data
interface CachedResponseData {
  response: Response;
  isStreamingResponse: boolean;
  timestamp: number;
}

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
  const cached = getMemoryCacheValue<CachedResponseData>(cacheKey);
  
  // Only use cache if it matches the request type (streaming vs non-streaming)
  if (cached && cached.isStreamingResponse === isStreamingRequest) {
    logEvent("info", "Cache hit", { cacheKey, isStreamingRequest });
    
    // For streaming responses, we need special handling
    if (cached.isStreamingResponse) {
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
  
  setMemoryCacheValue<CachedResponseData>(cacheKey, {
    response: response.clone(),
    isStreamingResponse,
    timestamp: Date.now()
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

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): Record<string, number> {
  const now = Date.now();
  const cache = getMemoryCacheValue<Record<string, CachedResponseData>>("__all__") || {};
  
  // Count total entries, streaming vs non-streaming, and average age
  let total = 0;
  let streaming = 0;
  let totalAge = 0;
  
  Object.values(cache).forEach(entry => {
    total++;
    if (entry.isStreamingResponse) streaming++;
    totalAge += now - (entry.timestamp || 0);
  });
  
  return {
    totalEntries: total,
    streamingEntries: streaming,
    nonStreamingEntries: total - streaming,
    averageAgeMs: total > 0 ? totalAge / total : 0
  };
}

export default {
  getCachedResponse,
  cacheResponse,
  cleanupCache,
  getCacheStats
};
