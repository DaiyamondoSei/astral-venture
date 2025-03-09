
import { corsHeaders } from "../../../shared/responseUtils.ts";

/**
 * Create a cached response for regular JSON data
 */
export function createJsonResponse(
  data: Uint8Array | string,
  headers: Record<string, string> = {}
): Response {
  return new Response(data, { 
    headers: { 
      ...corsHeaders, 
      "Content-Type": "application/json",
      "X-Cache": "HIT",
      ...headers
    }
  });
}

/**
 * Create a cached response for streaming data
 */
export function createStreamingResponse(
  data: Uint8Array | string
): Response {
  if (data instanceof Uint8Array) {
    const decoder = new TextDecoder();
    const text = decoder.decode(data);
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
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
  } else {
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        const chunks = data.split('\n\n');
        
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
}
