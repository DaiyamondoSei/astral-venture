
/**
 * Handler for processing AI responses
 */

import { createSuccessResponse } from "../../shared/responseUtils.ts";
import { extractInsights } from "../services/insightExtractor.ts";

/**
 * Process an AI response
 * 
 * @param content The AI response content
 * @param reflectionId Optional reflection ID
 * @param startTime The start time for timing metrics
 * @param model The AI model used
 * @param totalTokens The total tokens used
 * @returns Processed response
 */
export async function processAIResponse(
  content: string,
  reflectionId: string | undefined,
  startTime: number,
  model: string,
  totalTokens: number
): Promise<Response> {
  // Extract insights from the response
  const insights = extractInsights(content);
  
  // Calculate processing time
  const processingTime = Date.now() - startTime;
  
  // Return success response
  return createSuccessResponse(
    {
      answer: content,
      insights,
      reflectionId,
      meta: {
        model,
        tokenUsage: totalTokens,
        processingTime
      }
    },
    {
      processingTime,
      tokenUsage: totalTokens,
      model,
      version: "1.1.0"
    }
  );
}
