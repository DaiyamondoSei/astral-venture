
/**
 * Handler for processing AI responses
 */

import { createSuccessResponse } from "../../shared/responseUtils.ts";
import { extractKeyInsights, extractSuggestedPractices } from "../services/insightExtractor.ts";
import { AIModel } from "../services/openai/types.ts";

/**
 * Process an AI response and prepare a structured response
 * 
 * @param aiResponse The raw AI response text
 * @param reflectionId Optional reflection ID if this was a reflection analysis
 * @param startTime The start time of the request for timing metrics
 * @param model The AI model used
 * @param totalTokens The total tokens used
 * @returns Structured response with insights and metrics
 */
export async function processAIResponse(
  aiResponse: string, 
  reflectionId: string | undefined, 
  startTime: number, 
  model: AIModel,
  totalTokens: number
): Promise<Response> {
  // Extract insights from the response
  const insights = extractKeyInsights(aiResponse);
  
  // Process suggested practices from the response
  const suggestedPractices = extractSuggestedPractices(aiResponse);
  
  // Calculate processing time
  const processingTime = Date.now() - startTime;
  
  // Create related insights array
  // In a production app, this might come from a recommendation engine
  const relatedInsights = [];
  
  // Return success response
  return createSuccessResponse(
    {
      answer: aiResponse,
      insights,
      reflectionId,
      suggestedPractices,
      relatedInsights,
      meta: {
        model: model,
        tokenUsage: totalTokens,
        processingTime
      }
    },
    {
      processingTime,
      tokenUsage: totalTokens,
      model: model,
      version: "1.2.0"
    }
  );
}
