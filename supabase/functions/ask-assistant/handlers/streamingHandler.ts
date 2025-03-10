
/**
 * Streaming handler for AI responses
 */
import { corsHeaders } from "../../shared/responseUtils.ts";
import { generateStreamingResponse } from "../services/openai/index.ts";
import { cacheResponse } from "./cacheHandler.ts";
import { createCacheKey } from "../../shared/cacheUtils.ts";

/**
 * Process a streaming request to OpenAI
 * 
 * @param messages Messages for the OpenAI chat completion
 * @param model AI model to use
 * @param options Additional options for the API call
 * @returns Streaming response
 */
export async function handleStreamingRequest(
  messages: Array<{ role: string; content: string }>,
  model: string = "gpt-4o-mini",
  options: {
    temperature?: number;
    maxTokens?: number;
    useCache?: boolean;
    originalQuery?: string;
    context?: string;
  } = {}
): Promise<Response> {
  try {
    // Set up options with defaults
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? 1000;
    const useCache = options.useCache !== false;
    
    // Check cache if enabled
    if (useCache && options.originalQuery) {
      const cacheKey = createCacheKey(
        options.originalQuery,
        options.context || null,
        model
      );
      
      // Create streaming response from OpenAI
      const streamingResponse = await generateStreamingResponse(
        messages,
        {
          model: model as any,
          temperature,
          max_tokens: maxTokens
        }
      );
      
      // Create response with streaming content
      const response = new Response(streamingResponse, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream"
        }
      });
      
      // Cache the streaming response in the background if caching is enabled
      if (useCache && options.originalQuery) {
        const clonedResponse = response.clone();
        
        EdgeRuntime.waitUntil(
          cacheResponse(cacheKey, clonedResponse, true)
        );
      }
      
      return response;
    } else {
      // Create streaming response without caching
      const streamingResponse = await generateStreamingResponse(
        messages,
        {
          model: model as any,
          temperature,
          max_tokens: maxTokens
        }
      );
      
      return new Response(streamingResponse, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream"
        }
      });
    }
  } catch (error) {
    console.error("Error in streaming handler:", error);
    
    // Return error as a stream event
    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(controller) {
        const errorEvent = {
          error: error instanceof Error ? error.message : String(error),
          finished: true
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        controller.close();
      }
    });
    
    return new Response(errorStream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream"
      }
    });
  }
}
