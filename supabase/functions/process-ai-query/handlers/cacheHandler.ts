
/**
 * Cache handling utilities for AI query responses
 */

import { corsHeaders } from "../../shared/responseUtils.ts";

// In-memory cache for development (in production, this would use KV or Redis)
const responseCache = new Map<string, {
  response: Response;
  timestamp: number;
  isStream: boolean;
}>();

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
  const cached = responseCache.get(key);
  
  if (!cached) {
    return null;
  }
  
  // Check if cache entry has expired
  const now = Date.now();
  if (now - cached.timestamp > DEFAULT_CACHE_TTL) {
    responseCache.delete(key);
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
  responseCache.set(key, {
    response: response.clone(),
    timestamp: Date.now(),
    isStream
  });
  
  // Set up automatic cache expiration
  setTimeout(() => {
    responseCache.delete(key);
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
    const count = responseCache.size;
    responseCache.clear();
    return count;
  }
  
  const now = Date.now();
  let clearedCount = 0;
  
  // Clean up expired entries
  for (const [key, cached] of responseCache.entries()) {
    if (now - cached.timestamp > DEFAULT_CACHE_TTL) {
      responseCache.delete(key);
      clearedCount++;
    }
  }
  
  return clearedCount;
}
