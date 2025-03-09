
/**
 * Simple in-memory cache for responses
 * In a production environment, this would be replaced with a proper cache service
 */

// In-memory cache (not persistent across function invocations)
const cache = new Map<string, { data: any; timestamp: number; isStream: boolean }>();

/**
 * Get cached response if available and not expired
 */
export async function getCachedResponse(
  key: string,
  isStreamRequest: boolean
): Promise<Response | null> {
  if (!cache.has(key)) {
    return null;
  }

  const cachedItem = cache.get(key);
  
  // Check if cache is expired
  if (isCacheExpired(cachedItem?.timestamp || 0, cachedItem?.isStream || false)) {
    cache.delete(key);
    return null;
  }

  // Return cached response
  if (isStreamRequest && cachedItem?.isStream) {
    // For streaming responses, need to recreate a new stream
    return new Response(cachedItem.data, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } else if (!isStreamRequest && !cachedItem?.isStream) {
    // For regular responses
    return new Response(JSON.stringify(cachedItem.data), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // If request type doesn't match cache type, return null
  return null;
}

/**
 * Cache a response for future use
 */
export async function cacheResponse(
  key: string,
  response: Response,
  isStream: boolean,
  ttl: number = 30 * 60 * 1000 // Default 30 min TTL
): Promise<void> {
  try {
    if (isStream) {
      // For streaming responses, we need to clone and process the stream
      const clonedResponse = response.clone();
      const reader = clonedResponse.body?.getReader();
      
      if (!reader) return;
      
      let chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      // Combine all chunks
      const combinedChunks = concatenateUint8Arrays(chunks);
      
      // Store in cache
      cache.set(key, {
        data: combinedChunks,
        timestamp: Date.now(),
        isStream: true
      });
    } else {
      // For regular JSON responses
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      
      cache.set(key, {
        data,
        timestamp: Date.now(),
        isStream: false
      });
    }
  } catch (error) {
    console.error("Error caching response:", error);
  }
}

/**
 * Helper to concatenate Uint8Arrays
 */
function concatenateUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  // Calculate total length
  const totalLength = arrays.reduce((acc, array) => acc + array.length, 0);
  
  // Create a new array with the total length
  const result = new Uint8Array(totalLength);
  
  // Copy each array into the result
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }
  
  return result;
}

/**
 * Check if a cache item has expired
 */
function isCacheExpired(timestamp: number, isStream: boolean): boolean {
  const now = Date.now();
  // Streaming responses expire sooner (10 minutes)
  const ttl = isStream ? 10 * 60 * 1000 : 30 * 60 * 1000;
  return now - timestamp > ttl;
}

/**
 * Clear entire cache or remove expired items
 */
export async function cleanupCache(clearAll: boolean = false): Promise<number> {
  if (clearAll) {
    const count = cache.size;
    cache.clear();
    return count;
  }
  
  // Remove only expired items
  let removedCount = 0;
  for (const [key, item] of cache.entries()) {
    if (isCacheExpired(item.timestamp, item.isStream)) {
      cache.delete(key);
      removedCount++;
    }
  }
  
  return removedCount;
}
