
/**
 * Handlers for processing AI responses
 */

import { createSuccessResponse } from "../../shared/responseUtils.ts";
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
  
  // Structure and return the response
  return createSuccessResponse(
    responseData,
    { 
      timestamp: new Date().toISOString(),
      cached: false
    }
  );
}
