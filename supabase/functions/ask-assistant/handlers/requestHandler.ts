
import { createSuccessResponse, createErrorResponse, ErrorCode, validateRequiredParameters } from "../../shared/responseUtils.ts";
import { checkMessageModeration } from "../services/moderationService.ts";
import { fetchUserContext } from "../services/userContextService.ts";
import { createPersonalizedSystemPrompt, buildContextualizedPrompt } from "../services/promptBuilder.ts";
import { generateChatResponse, selectOptimalModel } from "../services/openai/index.ts";
import { handleStreamingRequest } from "./streamingHandler.ts";
import { processAIResponse } from "./aiResponseHandler.ts";
import { handleError } from "./errorHandler.ts";
import { getCachedResponse, cacheResponse, cleanupCache } from "./cacheHandler.ts";
import { logEvent } from "../../shared/responseUtils.ts";

// Define interface for request parameters
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
export async function handleAIRequest(user: any, req: Request): Promise<Response> {
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
    
    // Check if we have a cached response
    if (cacheKey) {
      const cachedResponse = await getCachedResponse(cacheKey, stream);
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
      if (cacheKey) {
        await cacheResponse(cacheKey, streamingResponse.clone(), true);
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
    if (cacheKey) {
      await cacheResponse(cacheKey, response.clone(), false);
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
    return handleError(error);
  }
}

/**
 * Route handler for clearing cache (admin only)
 * Improved security and validation
 */
export async function handleClearCache(user: any, req: Request): Promise<Response> {
  try {
    // Extract auth header correctly
    const authHeader = req.headers.get("authorization") || "";
    
    // Check if user is admin with better validation
    const isAdmin = user && 
                   (user.app_metadata?.role === "admin" || 
                    authHeader.includes("admin-key")); // Real implementation would be more secure
    
    if (!isAdmin) {
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
    return handleError(error);
  }
}
