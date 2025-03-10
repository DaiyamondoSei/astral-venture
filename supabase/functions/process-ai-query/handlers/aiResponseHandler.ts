
/**
 * Handlers for processing AI responses
 */

import { createSuccessResponse, logEvent } from "../../shared/responseUtils.ts";
import { extractInsights } from "../services/insightExtractor.ts";

/**
 * Process AI response with insights extraction and metrics
 * 
 * @param content - AI response content
 * @param reflectionId - Optional reflection ID
 * @param startTime - Processing start time
 * @param model - AI model used
 * @param tokensUsed - Tokens used for the request
 * @returns Formatted response
 */
export async function processAIResponse(
  content: string,
  reflectionId: string | undefined,
  startTime: number,
  model: string,
  tokensUsed: number
): Promise<Response> {
  try {
    // Extract insights from the AI response
    const insights = extractInsights(content);
    
    // Calculate processing time
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Prepare the response data
    const responseData = {
      answer: content,
      insights,
      metrics: {
        processingTime,
        tokensUsed,
        model,
        isReflectionAnalysis: Boolean(reflectionId)
      }
    };
    
    // Log successful response
    logEvent("info", "AI response processed successfully", {
      reflectionId,
      processingTime,
      insightsExtracted: insights.length,
      tokensUsed
    });
    
    // Structure and return the response
    return createSuccessResponse(
      responseData,
      { 
        timestamp: new Date().toISOString(),
        cached: false
      }
    );
  } catch (error) {
    // Log error but still return the content without enhancements
    logEvent("error", "Error processing AI response", {
      error: error instanceof Error ? error.message : String(error),
      reflectionId
    });
    
    // Return basic response without insights in case of error
    return createSuccessResponse(
      { 
        answer: content,
        insights: [],
        metrics: {
          processingTime: Date.now() - startTime,
          tokensUsed,
          model,
          isReflectionAnalysis: Boolean(reflectionId)
        }
      },
      { 
        timestamp: new Date().toISOString(),
        cached: false
      }
    );
  }
}

/**
 * Process streaming AI response
 * 
 * @param stream - ReadableStream from AI service
 * @param reflectionId - Optional reflection ID
 * @param model - AI model used
 * @returns Streaming response
 */
export function processStreamingAIResponse(
  stream: ReadableStream,
  reflectionId: string | undefined,
  model: string
): Response {
  // Log streaming response being sent
  logEvent("info", "Streaming AI response created", {
    reflectionId,
    model
  });
  
  // Return the streaming response with appropriate headers
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Content-Type-Options": "nosniff",
      "X-Model-Used": model,
      "X-Reflection-Id": reflectionId || "",
    }
  });
}
