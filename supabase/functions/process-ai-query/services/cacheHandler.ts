
import { 
  getFromMemoryCache, 
  storeInMemoryCache, 
  clearMemoryCache,
  getMemoryCacheSize
} from "./cache/memoryCache.ts";

import {
  getFromDatabaseCache,
  storeInDatabaseCache,
  clearExpiredDatabaseCache,
  clearAllDatabaseCache
} from "./cache/databaseCache.ts";

import {
  createJsonResponse,
  createStreamingResponse
} from "./cache/responseBuilder.ts";

import { isCacheExpired } from "../utils/cacheUtils.ts";

/**
 * Get a cached response if available and not expired
 */
export async function getCachedResponse(
  cacheKey: string, 
  isStreaming: boolean = false
): Promise<Response | null> {
  // Try memory cache first
  const memoryCached = getFromMemoryCache(cacheKey);
  
  if (memoryCached) {
    if (!isCacheExpired(memoryCached.timestamp, memoryCached.isStreaming)) {
      try {
        // For streaming responses
        if (memoryCached.isStreaming) {
          return createStreamingResponse(memoryCached.data);
        }
        
        // For regular responses
        return createJsonResponse(memoryCached.data);
      } catch (error) {
        console.error("Error recreating response from memory cache:", error);
      }
    }
  }
  
  // Try to get from Supabase cache if memory cache misses
  try {
    const dbCacheItem = await getFromDatabaseCache(cacheKey);
    
    if (!dbCacheItem) {
      return null;
    }
    
    // Check if cache is expired
    const createdAt = new Date(dbCacheItem.createdAt).getTime();
    
    if (isCacheExpired(createdAt, dbCacheItem.isStreaming)) {
      // Clean up expired entry in background
      EdgeRuntime.waitUntil(
        clearExpiredDatabaseCache()
      );
      
      return null;
    }
    
    // Add to memory cache for faster access next time
    try {
      const encoder = new TextEncoder();
      const encoded = encoder.encode(dbCacheItem.responseData);
      
      storeInMemoryCache(cacheKey, encoded, dbCacheItem.isStreaming);
    } catch (error) {
      console.error("Error adding response to memory cache:", error);
    }
    
    // Return the appropriate response type
    if (dbCacheItem.isStreaming) {
      return createStreamingResponse(dbCacheItem.responseData);
    }
    
    return createJsonResponse(dbCacheItem.responseData);
  } catch (error) {
    console.error("Error retrieving from cache:", error);
    return null;
  }
}

/**
 * Cache a response for future requests
 */
export async function cacheResponse(
  cacheKey: string, 
  response: Response, 
  isStreaming: boolean,
  ttl?: number
): Promise<void> {
  try {
    // Clone the response before reading it
    const clonedResponse = response.clone();
    
    // For streaming responses, collect the entire stream
    if (isStreaming) {
      const reader = clonedResponse.body?.getReader();
      if (!reader) return;
      
      let chunks: Uint8Array[] = [];
      let totalSize = 0;
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          totalSize += value.length;
        }
      } finally {
        reader.releaseLock();
      }
      
      // Combine all chunks
      const allChunks = new Uint8Array(totalSize);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }
      
      // Add to memory cache
      storeInMemoryCache(cacheKey, allChunks, true, ttl);
      
      // Save to persistent cache asynchronously
      const decoder = new TextDecoder();
      const streamContent = decoder.decode(allChunks);
      
      EdgeRuntime.waitUntil(
        storeInDatabaseCache(cacheKey, streamContent, true)
      );
      
      return;
    }
    
    // For regular responses
    const responseData = await clonedResponse.text();
    
    // Add to memory cache
    const encoder = new TextEncoder();
    storeInMemoryCache(cacheKey, encoder.encode(responseData), false, ttl);
    
    // Save to persistent cache asynchronously
    EdgeRuntime.waitUntil(
      storeInDatabaseCache(cacheKey, responseData, false)
    );
  } catch (error) {
    console.error("Error caching response:", error);
  }
}

/**
 * Clear all or expired cache entries
 */
export async function clearResponseCache(clearAll: boolean = false): Promise<number> {
  try {
    // Always clear memory cache
    const memoryCacheSize = clearMemoryCache();
    
    // Clear database cache
    let dbCacheCleared = 0;
    
    if (!clearAll) {
      dbCacheCleared = await clearExpiredDatabaseCache();
    } else {
      dbCacheCleared = await clearAllDatabaseCache();
    }
    
    return memoryCacheSize + dbCacheCleared;
  } catch (error) {
    console.error("Error clearing cache:", error);
    return 0;
  }
}
