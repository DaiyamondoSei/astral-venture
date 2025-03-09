
// In-memory cache for AI responses
const responseCache = new Map<string, {
  response: any,
  timestamp: number,
  expiresAt: number
}>();

// Default TTL for cached responses (10 minutes)
const DEFAULT_CACHE_TTL = 10 * 60 * 1000;

// Maximum size for cache to prevent memory issues
const MAX_CACHE_SIZE = 100;

/**
 * Get cached response if available
 */
export async function getCachedResponse(cacheKey: string): Promise<Response | null> {
  if (!cacheKey) return null;
  
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() <= cached.expiresAt) {
    console.log("Cache hit:", cacheKey);
    return new Response(
      JSON.stringify({ 
        ...cached.response,
        cached: true
      }),
      { 
        headers: { 
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
          "Content-Type": "application/json" 
        } 
      }
    );
  }
  
  return null;
}

/**
 * Cache a response
 */
export async function cacheResponse(cacheKey: string, response: any): Promise<void> {
  if (!cacheKey) return;
  
  // Clean up cache first
  await cleanupCache();
  
  responseCache.set(cacheKey, {
    response,
    timestamp: Date.now(),
    expiresAt: Date.now() + DEFAULT_CACHE_TTL
  });
  
  console.log(`Added to cache with key: ${cacheKey}, cache size: ${responseCache.size}`);
}

/**
 * Clean up expired cache entries and maintain size limits
 */
export async function cleanupCache(): Promise<number> {
  const now = Date.now();
  let deletionCount = 0;
  
  // Delete expired entries
  for (const [key, entry] of responseCache.entries()) {
    if (now > entry.expiresAt) {
      responseCache.delete(key);
      deletionCount++;
    }
  }
  
  // If cache is still too large, remove oldest entries
  if (responseCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(responseCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const entriesToDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    entriesToDelete.forEach(([key]) => {
      responseCache.delete(key);
      deletionCount++;
    });
  }
  
  return deletionCount;
}

/**
 * Clear all responses from the cache
 */
export async function clearResponseCache(): Promise<number> {
  const count = responseCache.size;
  responseCache.clear();
  return count;
}
