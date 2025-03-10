
// Simple in-memory cache with TTL and better type safety
const responseCache = new Map<string, {
  response: Response,
  timestamp: number,
  expiresAt: number,
  isStreamingResponse: boolean
}>();

// Cache management constants
const DEFAULT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 100;

/**
 * Get a cached response if available
 */
export async function getCachedResponse(
  cacheKey: string, 
  isStreamingRequest: boolean
): Promise<Response | null> {
  const cached = responseCache.get(cacheKey);
  
  // Only use cache if it matches the request type (streaming vs non-streaming)
  if (cached && cached.isStreamingResponse === isStreamingRequest && Date.now() <= cached.expiresAt) {
    console.log("Cache hit:", cacheKey, isStreamingRequest ? "(streaming)" : "(non-streaming)");
    return cached.response.clone(); // Return a clone of the cached response
  }
  
  return null;
}

/**
 * Cache a response for future use
 */
export async function cacheResponse(
  cacheKey: string, 
  response: Response, 
  isStreamingResponse: boolean,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<void> {
  // Clean up cache first
  await cleanupCache();
  
  responseCache.set(cacheKey, {
    response: response.clone(), // Store a clone of the response
    timestamp: Date.now(),
    expiresAt: Date.now() + ttl,
    isStreamingResponse
  });
  
  console.log(`Added ${isStreamingResponse ? "streaming" : "non-streaming"} response to cache with key: ${cacheKey}`);
}

/**
 * Clean up expired cache entries and maintain cache size limits
 */
export async function cleanupCache(forceCleanAll = false): Promise<number> {
  const now = Date.now();
  let deletionCount = 0;
  
  if (forceCleanAll) {
    const size = responseCache.size;
    responseCache.clear();
    return size;
  }
  
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
  
  if (deletionCount > 0) {
    console.log(`Cleaned up ${deletionCount} cache entries, ${responseCache.size} remaining`);
  }
  
  return deletionCount;
}
