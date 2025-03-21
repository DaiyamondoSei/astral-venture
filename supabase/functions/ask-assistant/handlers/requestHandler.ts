
import { createSuccessResponse, createErrorResponse, ErrorCode, validateRequiredParameters, ErrorHandlingOptions } from "../../shared/responseUtils.ts";
import { checkMessageModeration } from "../services/moderationService.ts";
import { fetchUserContext } from "../services/userContextService.ts";
import { createPersonalizedSystemPrompt, buildContextualizedPrompt } from "../services/promptBuilder.ts";
import { generateChatResponse, selectOptimalModel } from "../services/openai/index.ts";
import { handleStreamingRequest } from "./streamingHandler.ts";
import { processAIResponse } from "./aiResponseHandler.ts";
import { handleError } from "./errorHandler.ts";
import { getCachedResponse, cacheResponse, cleanupCache } from "./cacheHandler.ts";
import { logEvent } from "../../shared/responseUtils.ts";
import { createCacheKey } from "../../shared/cacheUtils.ts";
import { isAdmin } from "../../shared/authUtils.ts";

// Define improved interface for request parameters
interface AIRequestParams {
  message: string;
  reflectionId?: string;
  reflectionContent?: string;
  stream?: boolean;
  cacheKey?: string;
}

/**
 * Main request handler for AI assistant requests
 * Optimized for better error handling and caching
 */
export async function handleAIRequest(
  user: any, 
  req: Request,
  options: ErrorHandlingOptions = {}
): Promise<Response> {
  try {
    // Parse request body
    const params = await req.json() as AIRequestParams;
    const { 
      message = "", 
      reflectionId = "", 
      reflectionContent = "", 
      stream = false,
      cacheKey = "" 
    } = params;
    
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
    
    // Generate cache key if not provided
    const actualCacheKey = cacheKey || createCacheKey(message, reflectionContent);
    
    // Check if we have a cached response
    if (actualCacheKey) {
      const cachedResponse = await getCachedResponse(actualCacheKey, stream);
      if (cachedResponse) {
        return cachedResponse;
      }
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
      const streamingResponse = await handleStreamingRequest(prompt, systemPrompt, model);
      
      // Cache the streaming response if we have a cache key
      if (actualCacheKey) {
        await cacheResponse(actualCacheKey, streamingResponse.clone(), true);
      }
      
      return streamingResponse;
    }
    
    // Generate response from AI for non-streaming requests
    const { content: aiResponse, metrics } = await generateChatResponse(
      prompt, 
      systemPrompt,
      { model }
    );
    
    // Process AI response and return structured response
    const response = await processAIResponse(
      aiResponse, 
      reflectionId, 
      startTime, 
      model, 
      metrics.totalTokens
    );
    
    // Cache the response if we have a cache key
    if (actualCacheKey) {
      await cacheResponse(actualCacheKey, response.clone(), false);
    }
    
    logEvent("info", "AI response generated successfully", {
      userId: user.id,
      processingTimeMs: Date.now() - startTime,
      model,
      tokens: metrics.totalTokens,
      cached: false
    });
    
    return response;
  } catch (error) {
    return handleError(error, options);
  }
}

/**
 * Route handler for clearing cache (admin only)
 * Improved security and validation
 */
export async function handleClearCache(
  user: any, 
  req: Request,
  options: ErrorHandlingOptions = {}
): Promise<Response> {
  try {
    // Check if user is admin
    if (!isAdmin(user)) {
      return createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Admin privileges required",
        { userId: user?.id }
      );
    }
    
    // Clear the cache
    const clearedCount = await cleanupCache(true);
    
    logEvent("info", "Cache cleared by admin", {
      userId: user.id,
      clearedCount,
      timestamp: new Date().toISOString()
    });
    
    return createSuccessResponse(
      { cleared: clearedCount, timestamp: new Date().toISOString() },
      { operation: "cache_clear" }
    );
  } catch (error) {
    return handleError(error, options);
  }
}
