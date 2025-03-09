
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../../shared/responseUtils.ts";

// Cache expiration time in milliseconds (default: 30 minutes)
const CACHE_EXPIRY = 30 * 60 * 1000;

// Cache TTL for streaming responses (shorter: 10 minutes)
const STREAMING_CACHE_EXPIRY = 10 * 60 * 1000;

// Memory cache for responses
const memoryCache = new Map<string, { 
  data: Uint8Array, 
  timestamp: number,
  isStreaming: boolean
}>();

/**
 * Get a cached response if available and not expired
 */
export async function getCachedResponse(
  cacheKey: string, 
  isStreaming: boolean = false
): Promise<Response | null> {
  // Try memory cache first
  const memoryCached = memoryCache.get(cacheKey);
  if (memoryCached) {
    const now = Date.now();
    const expiryTime = isStreaming ? STREAMING_CACHE_EXPIRY : CACHE_EXPIRY;
    
    if (now - memoryCached.timestamp < expiryTime) {
      try {
        // For streaming responses, we need to create a new ReadableStream
        if (memoryCached.isStreaming) {
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              const decoder = new TextDecoder();
              const text = decoder.decode(memoryCached.data);
              const chunks = text.split('\n\n');
              
              for (const chunk of chunks) {
                if (chunk.trim()) {
                  controller.enqueue(encoder.encode(chunk + '\n\n'));
                }
              }
              controller.close();
            }
          });
          
          return new Response(stream, { 
            headers: { 
              ...corsHeaders, 
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "X-Cache": "HIT"
            }
          });
        }
        
        // For regular responses
        return new Response(memoryCached.data, { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-Cache": "HIT"
          }
        });
      } catch (error) {
        console.error("Error recreating response from memory cache:", error);
        // Memory cache error, fall through to try Supabase cache
      }
    } else {
      // Remove expired item from memory cache
      memoryCache.delete(cacheKey);
    }
  }
  
  // Try to get from Supabase cache if memory cache misses
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    const { data, error } = await supabaseAdmin
      .from("ai_response_cache")
      .select("response_data, created_at, is_streaming")
      .eq("cache_key", cacheKey)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Check if cache is expired
    const createdAt = new Date(data.created_at).getTime();
    const now = Date.now();
    const expiryTime = data.is_streaming ? STREAMING_CACHE_EXPIRY : CACHE_EXPIRY;
    
    if (now - createdAt > expiryTime) {
      // Cache expired, clean it up asynchronously
      EdgeRuntime.waitUntil(
        supabaseAdmin
          .from("ai_response_cache")
          .delete()
          .eq("cache_key", cacheKey)
      );
      
      return null;
    }
    
    // Decode and return cached response
    const responseData = data.response_data;
    
    // Add to memory cache for faster access next time
    try {
      const encoder = new TextEncoder();
      const encoded = encoder.encode(responseData);
      memoryCache.set(cacheKey, {
        data: encoded,
        timestamp: now,
        isStreaming: data.is_streaming
      });
    } catch (memError) {
      console.error("Error adding response to memory cache:", memError);
    }
    
    // For streaming responses
    if (data.is_streaming) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const chunks = responseData.split('\n\n');
          
          for (const chunk of chunks) {
            if (chunk.trim()) {
              controller.enqueue(encoder.encode(chunk + '\n\n'));
            }
          }
          controller.close();
        }
      });
      
      return new Response(stream, { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-Cache": "HIT"
        }
      });
    }
    
    // For regular responses
    return new Response(responseData, { 
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "X-Cache": "HIT"
      }
    });
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
  isStreaming: boolean
): Promise<void> {
  try {
    // Clone the response before reading it
    const clonedResponse = response.clone();
    
    // For streaming responses, we need to collect the entire stream
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
      memoryCache.set(cacheKey, {
        data: allChunks,
        timestamp: Date.now(),
        isStreaming: true
      });
      
      // Save to persistent cache asynchronously
      const decoder = new TextDecoder();
      const streamContent = decoder.decode(allChunks);
      
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );
      
      EdgeRuntime.waitUntil(
        supabaseAdmin
          .from("ai_response_cache")
          .upsert({
            cache_key: cacheKey,
            response_data: streamContent,
            is_streaming: true,
            created_at: new Date().toISOString()
          })
      );
      
      return;
    }
    
    // For regular responses
    const responseData = await clonedResponse.text();
    
    // Add to memory cache
    const encoder = new TextEncoder();
    memoryCache.set(cacheKey, {
      data: encoder.encode(responseData),
      timestamp: Date.now(),
      isStreaming: false
    });
    
    // Save to persistent cache asynchronously
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    EdgeRuntime.waitUntil(
      supabaseAdmin
        .from("ai_response_cache")
        .upsert({
          cache_key: cacheKey,
          response_data: responseData,
          is_streaming: false,
          created_at: new Date().toISOString()
        })
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
    const memoryCacheSize = memoryCache.size;
    memoryCache.clear();
    
    // Clear database cache
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    let query = supabaseAdmin.from("ai_response_cache");
    
    // If not clearing all, only clear expired entries
    if (!clearAll) {
      const streamingExpiryTime = new Date(Date.now() - STREAMING_CACHE_EXPIRY).toISOString();
      const regularExpiryTime = new Date(Date.now() - CACHE_EXPIRY).toISOString();
      
      // Delete expired streaming entries
      const { count: streamingCount } = await query
        .delete()
        .eq("is_streaming", true)
        .lt("created_at", streamingExpiryTime)
        .select("count");
      
      // Delete expired regular entries
      const { count: regularCount } = await query
        .delete()
        .eq("is_streaming", false)
        .lt("created_at", regularExpiryTime)
        .select("count");
      
      return (streamingCount || 0) + (regularCount || 0) + memoryCacheSize;
    }
    
    // Clear all entries
    const { count } = await query.delete().select("count");
    return (count || 0) + memoryCacheSize;
  } catch (error) {
    console.error("Error clearing cache:", error);
    return 0;
  }
}
