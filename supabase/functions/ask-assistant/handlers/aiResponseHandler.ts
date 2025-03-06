
import { createSuccessResponse } from "../../shared/responseUtils.ts";
import { extractKeyInsights, extractSuggestedPractices } from "../services/responseGenerator.ts";
import { AIModel } from "../services/openaiService.ts";

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
  
  // Return success response
  return createSuccessResponse(
    {
      answer: aiResponse,
      insights,
      reflectionId,
      suggestedPractices,
      relatedInsights: []
    },
    {
      processingTime,
      tokenUsage: totalTokens,
      model: model,
      version: "1.2.0"
    }
  );
}
