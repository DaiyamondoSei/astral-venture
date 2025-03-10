
/**
 * Cache handler for AI responses
 */
import { corsHeaders } from "../../shared/responseUtils.ts";
import { setCacheValue, getCacheValue } from "../../shared/cacheUtils.ts";

// Default cache TTL (30 minutes)
const DEFAULT_CACHE_TTL = 30 * 60 * 1000;

/**
 * Get a cached response if available
 * 
 * @param cacheKey The cache key to check
 * @param isStream Whether the response is a streaming response
 * @returns Cached response or null if not cached
 */
export async function getCachedResponse(
  cacheKey: string,
  isStream: boolean = false
): Promise<Response | null> {
  try {
    // Get cached data
    const cachedData = await getCacheValue<any>(cacheKey);
    
    // Return null if not in cache
    if (!cachedData) {
      return null;
    }
    
    // Handle streaming response differently
    if (isStream) {
      // For streaming, we need to convert cached content into a stream
      const encoder = new TextEncoder();
      const streamInit = {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream"
        }
      };
      
      // Create a stream where we push all the cached events
      const stream = new ReadableStream({
        start(controller) {
          // Add all cached events
          for (const event of cachedData.events) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          }
          
          // Add final event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ finished: true })}\n\n`));
          
          // Close the stream
          controller.close();
        }
      });
      
      return new Response(stream, streamInit);
    } else {
      // For regular responses, reconstruct the Response object
      return new Response(JSON.stringify(cachedData), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-Cache": "HIT"
        }
      });
    }
  } catch (error) {
    console.error("Cache retrieval error:", error);
    return null;
  }
}

/**
 * Cache a response for future use
 * 
 * @param cacheKey The cache key to use
 * @param response The response to cache
 * @param isStream Whether the response is a streaming response
 * @param ttl Cache time-to-live in milliseconds
 * @returns Success status
 */
export async function cacheResponse(
  cacheKey: string,
  response: Response,
  isStream: boolean = false,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<boolean> {
  try {
    if (isStream) {
      // For streaming, we need to capture all events
      const reader = response.body?.getReader();
      if (!reader) return false;
      
      const decoder = new TextDecoder();
      const events: any[] = [];
      
      // Read and process all chunks
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          const lines = chunk.split("\n\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const eventData = JSON.parse(line.slice(6));
                events.push(eventData);
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
      
      // Cache the stream events
      await setCacheValue(cacheKey, { events }, ttl);
    } else {
      // For regular responses, clone and extract JSON
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      
      // Cache the response data
      await setCacheValue(cacheKey, data, ttl);
    }
    
    return true;
  } catch (error) {
    console.error("Cache storage error:", error);
    return false;
  }
}
