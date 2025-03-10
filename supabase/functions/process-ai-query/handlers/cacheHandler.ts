
import { corsHeaders } from "../../shared/responseUtils.ts";
import { getFromMemoryCache, storeInMemoryCache } from "../services/cache/memoryCache.ts";
import { 
  getFromDatabaseCache, 
  storeInDatabaseCache
} from "../services/cache/databaseCache.ts";
import { calculateCacheTTL } from "../../shared/cacheUtils.ts";

/**
 * Get a cached response if available
 * First checks in-memory cache, then falls back to database cache
 */
export async function getCachedResponse(
  cacheKey: string, 
  isStreamingRequest: boolean
): Promise<Response | null> {
  // Check memory cache first for performance
  const cachedMemoryData = getFromMemoryCache(cacheKey);
  
  if (cachedMemoryData) {
    console.log(`Memory cache hit for key: ${cacheKey}`);
    
    // Ensure the data type (streaming vs non-streaming) matches
    if (cachedMemoryData.isStreaming === isStreamingRequest) {
      return new Response(cachedMemoryData.data, {
        headers: {
          ...corsHeaders,
          "Content-Type": isStreamingRequest 
            ? "text/event-stream" 
            : "application/json",
          "Cache-Control": "max-age=300",
          "X-Cache-Source": "memory"
        }
      });
    }
  }
  
  // Check database cache as fallback
  const dbCacheData = await getFromDatabaseCache(cacheKey);
  
  if (dbCacheData && dbCacheData.isStreaming === isStreamingRequest) {
    console.log(`Database cache hit for key: ${cacheKey}`);
    
    // Store in memory cache for faster access next time
    if (dbCacheData.responseData) {
      const encoder = new TextEncoder();
      const responseData = encoder.encode(dbCacheData.responseData);
      
      storeInMemoryCache(
        cacheKey, 
        responseData, 
        isStreamingRequest
      );
    }
    
    return new Response(dbCacheData.responseData, {
      headers: {
        ...corsHeaders,
        "Content-Type": isStreamingRequest 
          ? "text/event-stream" 
          : "application/json",
        "Cache-Control": "max-age=300",
        "X-Cache-Source": "database"
      }
    });
  }
  
  return null;
}

/**
 * Cache a response for future use
 * Stores in both memory and database caches
 */
export async function cacheResponse(
  cacheKey: string, 
  response: Response, 
  isStreamingResponse: boolean,
  ttl?: number
): Promise<void> {
  try {
    // Clone the response so we can read the body
    const responseClone = response.clone();
    const contentType = isStreamingResponse ? "streaming" : "query";
    
    // Calculate appropriate TTL if not provided
    const cacheTTL = ttl || calculateCacheTTL(contentType);
    
    // Get response as array buffer
    const responseBuffer = await responseClone.arrayBuffer();
    const responseData = new Uint8Array(responseBuffer);
    
    // Store in memory cache
    storeInMemoryCache(
      cacheKey, 
      responseData, 
      isStreamingResponse, 
      cacheTTL
    );
    
    // Store in database cache for persistence across edge function invocations
    const responseText = new TextDecoder().decode(responseData);
    
    // Run as a background task
    EdgeRuntime.waitUntil(
      storeInDatabaseCache(cacheKey, responseText, isStreamingResponse)
    );
    
    console.log(`Response cached with key: ${cacheKey}, ttl: ${cacheTTL}ms`);
  } catch (error) {
    console.error("Error caching response:", error);
  }
}

/**
 * Clear all cache entries (for maintenance/debugging)
 */
export async function cleanupCache(forceCleanAll = false): Promise<number> {
  try {
    // Implement cleanup logic
    // This could involve clearing expired items from both memory and database caches
    
    // For now, we're just logging this and returning 0
    console.log("Cache cleanup requested, force clean all:", forceCleanAll);
    return 0;
  } catch (error) {
    console.error("Error cleaning up cache:", error);
    return 0;
  }
}
