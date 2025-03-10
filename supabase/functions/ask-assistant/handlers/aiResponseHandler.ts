
/**
 * Handler for processing AI responses
 */
import { corsHeaders, createSuccessResponse, createErrorResponse, logEvent } from "../../shared/responseUtils.ts";
import { extractInsights } from "../services/insightExtractor.ts";
import { cacheResponse } from "./cacheHandler.ts";
import { createCacheKey } from "../../shared/cacheUtils.ts";

/**
 * Process an AI response
 * 
 * @param content The response content from OpenAI
 * @param startTime Performance timing start
 * @param model The model used for the request
 * @param totalTokens The total tokens used for the request
 * @returns Response object with processed data
 */
export async function processAIResponse(
  content: string,
  startTime: number,
  model: string,
  totalTokens: number
): Promise<Response> {
  try {
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Extract insights using the insight extractor
    const insights = extractInsights(content);
    
    // Build the response data
    const responseData = {
      response: content,
      insights,
      metrics: {
        processingTime,
        tokenUsage: totalTokens,
        model
      }
    };
    
    // Return formatted response
    return createSuccessResponse(responseData);
  } catch (error) {
    logEvent("error", "Error processing AI response", {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return createErrorResponse(
      "processing_error",
      "Failed to process AI response",
      { details: error instanceof Error ? error.message : String(error) }
    );
  }
}

/**
 * Create a cached response
 * 
 * @param query The original query
 * @param response The response to cache
 * @param model The model used for the request
 * @param context Optional context information
 * @returns The cache key used
 */
export async function createCachedResponse(
  query: string,
  response: any,
  model: string,
  context?: string | null
): Promise<string> {
  try {
    // Generate cache key
    const cacheKey = createCacheKey(query, context, model);
    
    // Store in cache
    await cacheResponse(cacheKey, response.clone(), false);
    
    return cacheKey;
  } catch (error) {
    logEvent("error", "Error creating cached response", {
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Return empty key on error
    return "";
  }
}

/**
 * Format streaming response for streaming endpoint
 * 
 * @param streamResponse The streaming response from OpenAI
 * @returns Formatted response object for streaming
 */
export function formatStreamingResponse(
  streamResponse: ReadableStream<Uint8Array>
): Response {
  return new Response(streamResponse, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream"
    }
  });
}
