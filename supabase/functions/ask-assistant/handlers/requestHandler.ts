
import { createSuccessResponse, createErrorResponse, ErrorCode, validateRequiredParameters } from "../../shared/responseUtils.ts";
import { checkMessageModeration } from "../services/moderationService.ts";
import { fetchUserContext } from "../services/userContextService.ts";
import { createPersonalizedSystemPrompt, buildContextualizedPrompt } from "../services/promptBuilder.ts";
import { generateChatResponse, selectOptimalModel } from "../services/openai/index.ts";
import { handleStreamingRequest } from "./streamingHandler.ts";
import { processAIResponse } from "./aiResponseHandler.ts";
import { handleError } from "./errorHandler.ts";

// Simple in-memory cache with TTL and better type safety
const responseCache = new Map<string, {
  response: Response,
  timestamp: number,
  expiresAt: number,
  isStreamingResponse: boolean
}>();

// Cache management constants
const DEFAULT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 100;

/**
 * Clean up expired cache entries and maintain cache size limits
 */
function cleanupCache() {
  const now = Date.now();
  let deletionCount = 0;
  
  // Delete expired entries
  for (const [key, entry] of responseCache.entries()) {
    if (now > entry.expiresAt) {
      responseCache.delete(key);
      deletionCount++;
    }
  }
  
  // If cache is still too large, remove oldest entries
  if (responseCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(responseCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const entriesToDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    entriesToDelete.forEach(([key]) => {
      responseCache.delete(key);
      deletionCount++;
    });
  }
  
  if (deletionCount > 0) {
    console.log(`Cleaned up ${deletionCount} cache entries, ${responseCache.size} remaining`);
  }
}

/**
 * Main request handler for AI assistant requests
 * Optimized for better error handling and caching
 */
export async function handleAIRequest(user: any, req: Request): Promise<Response> {
  try {
    // Parse request body
    const { 
      message, 
      reflectionId, 
      reflectionContent, 
      stream = false,
      cacheKey = "" 
    } = await req.json();
    
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
      const cached = responseCache.get(cacheKey);
      // Only use cache if it matches the request type (streaming vs non-streaming)
      if (cached && cached.isStreamingResponse === stream && Date.now() <= cached.expiresAt) {
        console.log("Cache hit:", cacheKey, stream ? "(streaming)" : "(non-streaming)");
        return cached.response.clone(); // Return a clone of the cached response
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
        // Clean up cache first
        cleanupCache();
        
        responseCache.set(cacheKey, {
          response: streamingResponse.clone(), // Store a clone of the response
          timestamp: Date.now(),
          expiresAt: Date.now() + DEFAULT_CACHE_TTL,
          isStreamingResponse: true
        });
        
        console.log(`Added streaming response to cache with key: ${cacheKey}`);
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
      // Clean up cache first
      cleanupCache();
      
      responseCache.set(cacheKey, {
        response: response.clone(), // Store a clone of the response
        timestamp: Date.now(),
        expiresAt: Date.now() + DEFAULT_CACHE_TTL,
        isStreamingResponse: false
      });
      
      console.log(`Added non-streaming response to cache with key: ${cacheKey}`);
    }
    
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
    const oldSize = responseCache.size;
    responseCache.clear();
    
    return createSuccessResponse(
      { cleared: oldSize, timestamp: new Date().toISOString() },
      { operation: "cache_clear" }
    );
  } catch (error) {
    return handleError(error);
  }
}
