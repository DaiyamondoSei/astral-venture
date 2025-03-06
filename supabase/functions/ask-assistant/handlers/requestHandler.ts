import { createSuccessResponse, createErrorResponse, ErrorCode, validateRequiredParameters } from "../../shared/responseUtils.ts";
import { checkMessageModeration } from "../services/moderationService.ts";
import { fetchUserContext } from "../services/userContextService.ts";
import { createPersonalizedSystemPrompt, buildContextualizedPrompt, extractKeyInsights, extractSuggestedPractices } from "../services/responseGenerator.ts";
import { generateChatResponse, generateStreamingResponse, selectOptimalModel, AIModel } from "../services/openaiService.ts";

// Main request handler (runs after authentication)
export async function handleAIRequest(user: any, req: Request): Promise<Response> {
  try {
    // Parse request body
    const { message, reflectionId, reflectionContent, stream = false } = await req.json();
    
    // Validate required parameters
    const validation = validateRequiredParameters(
      { message },
      ["message"]
    );
    
    if (!validation.isValid) {
      return createErrorResponse(
        ErrorCode.MISSING_PARAMETERS,
        "Missing required parameters",
        { missingParams: validation.missingParams }
      );
    }
    
    // Check message content for moderation
    const moderationCheck = await checkMessageModeration(message);
    if (!moderationCheck.allowed) {
      return createErrorResponse(
        ErrorCode.VALIDATION_FAILED,
        "Message flagged by content moderation",
        { flags: moderationCheck.flags }
      );
    }
    
    // Process start time for tracking
    const startTime = Date.now();
    
    // Fetch user context for personalized responses
    const userContext = await fetchUserContext(user.id);
    
    // Create personalized system prompt based on user context
    const systemPrompt = createPersonalizedSystemPrompt(userContext);
    
    // Build prompt with additional context
    const prompt = buildContextualizedPrompt(
      message,
      userContext,
      reflectionContent
    );
    
    // Determine the best model based on message complexity
    const model = selectOptimalModel(message);
    
    // Check if this is a streaming request
    if (stream) {
      return handleStreamingRequest(prompt, systemPrompt, model);
    }
    
    // Generate response from AI for non-streaming requests
    const { content: aiResponse, metrics } = await generateChatResponse(
      prompt, 
      systemPrompt,
      { model }
    );
    
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
        tokenUsage: metrics.totalTokens,
        model: metrics.model,
        version: "1.2.0"
      }
    );
  } catch (error) {
    console.error("Error in ask-assistant function:", error);
    
    // Determine if it's a quota error
    const isQuotaError = error.message && error.message.includes("quota");
    
    return createErrorResponse(
      isQuotaError ? ErrorCode.QUOTA_EXCEEDED : ErrorCode.INTERNAL_ERROR,
      isQuotaError ? "AI service quota exceeded" : "Failed to process request",
      { errorMessage: error.message }
    );
  }
}

// Handle streaming responses with improved implementation
async function handleStreamingRequest(
  prompt: string, 
  systemPrompt: string, 
  model: AIModel
): Promise<Response> {
  try {
    // Use OpenAI's streaming API integration
    const { response, metrics } = await generateStreamingResponse(
      prompt, 
      systemPrompt,
      { model }
    );
    
    return response;
  } catch (error) {
    console.error("Error in streaming request:", error);
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "Failed to process streaming request",
      { errorMessage: error.message }
    );
  }
}

// Extract suggested practices from AI response
export function extractSuggestedPractices(response: string): string[] {
  const practices: string[] = [];
  
  // Look for sections that might contain practices
  const practiceSections = [
    /suggested practices?:?\s*([\s\S]*?)(?=\n\n|$)/i,
    /recommended practices?:?\s*([\s\S]*?)(?=\n\n|$)/i,
    /try these practices?:?\s*([\s\S]*?)(?=\n\n|$)/i,
    /exercises? to try:?\s*([\s\S]*?)(?=\n\n|$)/i
  ];
  
  // Try to find practice sections
  for (const regex of practiceSections) {
    const match = response.match(regex);
    if (match && match[1]) {
      // Split by bullet points or numbers
      const items = match[1]
        .split(/\n[-•*]\s*|\n\d+\.\s*/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      practices.push(...items);
      
      // If we found practices, no need to check other patterns
      if (items.length > 0) {
        break;
      }
    }
  }
  
  // If no structured practices found, look for sentences with practice keywords
  if (practices.length === 0) {
    const practiceKeywords = [
      "try", "practice", "exercise", "technique", "meditation", 
      "breathe", "visualize", "journal", "reflect"
    ];
    
    const sentences = response.split(/[.!?]+/).map(s => s.trim());
    
    for (const sentence of sentences) {
      if (sentence.length > 15 && sentence.length < 120) {
        for (const keyword of practiceKeywords) {
          if (sentence.toLowerCase().includes(keyword)) {
            practices.push(sentence);
            break;
          }
        }
      }
      
      // Limit to 3 practices
      if (practices.length >= 3) break;
    }
  }
  
  return practices.slice(0, 3); // Limit to top 3 practices
}
