
import { createSuccessResponse, createErrorResponse, ErrorCode, validateRequiredParameters } from "../../shared/responseUtils.ts";
import { checkMessageModeration } from "../services/moderationService.ts";
import { fetchUserContext } from "../services/userContextService.ts";
import { createPersonalizedSystemPrompt, buildContextualizedPrompt } from "../services/responseGenerator.ts";
import { generateChatResponse, selectOptimalModel } from "../services/openaiService.ts";
import { handleStreamingRequest } from "./streamingHandler.ts";
import { processAIResponse } from "./aiResponseHandler.ts";
import { handleError } from "./errorHandler.ts";

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
    
    // Process AI response and return structured response
    return processAIResponse(
      aiResponse, 
      reflectionId, 
      startTime, 
      model, 
      metrics.totalTokens
    );
  } catch (error) {
    return handleError(error);
  }
}
