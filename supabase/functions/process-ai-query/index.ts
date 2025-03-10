
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

import { 
  corsHeaders, 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  handleCorsRequest,
  validateRequiredParameters,
  validateParameterTypes
} from "../shared/responseUtils.ts";

import { withAuth, createAdminClient } from "../shared/authUtils.ts";
import { fetchUserContext, buildContextualizedPrompt } from "./handlers/contextHandler.ts";
import { createInsightPrompt, createEmotionalAnalysisPrompt } from "./utils/promptUtils.ts";
import { generateChatResponse, selectOptimalModel } from "./services/openai/index.ts";
import { processAIResponse } from "./handlers/aiResponseHandler.ts";
import { getCachedResponse, cacheResponse } from "./handlers/cacheHandler.ts";

// Main entry point for edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  return withAuth(req, handleRequest);
});

// Process AI query request (after authentication)
async function handleRequest(user: any, req: Request): Promise<Response> {
  try {
    // Process start time for tracking
    const startTime = Date.now();

    // Parse request body
    const requestData = await req.json();
    
    // Validate required parameters
    const { query } = requestData;
    const paramValidation = validateRequiredParameters(
      { query },
      ["query"]
    );
    
    if (!paramValidation.isValid) {
      return createErrorResponse(
        ErrorCode.MISSING_PARAMETERS,
        "Missing required parameters",
        { missingParams: paramValidation.missingParams },
        400
      );
    }
    
    // Extract optional parameters
    const { reflectionId, reflectionContent, cacheKey } = requestData;

    // Check if we have a cached response
    if (cacheKey) {
      console.log(`Checking cache for key: ${cacheKey}`);
      const cachedResponse = await getCachedResponse(cacheKey, false);
      if (cachedResponse) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return cachedResponse;
      }
      console.log(`Cache miss for key: ${cacheKey}`);
    }

    // Fetch user context
    console.log(`Fetching context for user: ${user.id}`);
    const userContext = await fetchUserContext(user.id);
    
    // Build the prompt based on the query type
    let prompt = query;
    let systemPrompt = "You are a helpful AI assistant specialized in consciousness, meditation, and personal growth.";
    
    // If this is a reflection analysis
    if (reflectionContent) {
      console.log("Building emotional analysis prompt");
      prompt = createEmotionalAnalysisPrompt(reflectionContent);
      systemPrompt += " You provide empathetic, insightful analysis of emotional reflections.";
    } else {
      // For general queries, build a contextualized prompt
      console.log("Building contextualized prompt");
      prompt = buildContextualizedPrompt(query, userContext);
    }
    
    // Determine the optimal model for this query
    const model = selectOptimalModel(prompt);
    console.log(`Selected model: ${model} for query`);
    
    // Generate response from OpenAI
    console.log("Generating OpenAI response");
    const { content: aiResponse, metrics } = await generateChatResponse(
      prompt,
      systemPrompt,
      { model }
    );
    
    // Process the AI response
    console.log("Processing AI response");
    const response = await processAIResponse(
      aiResponse,
      reflectionId,
      startTime,
      model,
      metrics.totalTokens
    );
    
    // Cache the response if we have a cache key
    if (cacheKey) {
      console.log(`Caching response with key: ${cacheKey}`);
      await cacheResponse(cacheKey, response.clone(), false);
    }
    
    // Record analytics in the background
    const recordAnalytics = async () => {
      try {
        const supabase = createAdminClient();
        await supabase.from('ai_interaction_logs').insert({
          user_id: user.id,
          query_type: reflectionContent ? 'reflection_analysis' : 'general_query',
          model: model,
          tokens_used: metrics.totalTokens,
          processing_time: Date.now() - startTime,
          query_text: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
          reflection_id: reflectionId
        });
      } catch (error) {
        console.error("Failed to record analytics:", error);
      }
    };
    
    EdgeRuntime.waitUntil(recordAnalytics());
    
    return response;
  } catch (error) {
    console.error("Error in process-ai-query:", error);
    
    // Determine error type for better client handling
    if (error.message?.includes("OpenAI") || error.message?.includes("API")) {
      return createErrorResponse(
        ErrorCode.EXTERNAL_API_ERROR,
        "Error communicating with AI service",
        { errorMessage: error.message }
      );
    }
    
    if (error.message?.includes("database") || error.message?.includes("query")) {
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Database error occurred",
        { errorMessage: error.message }
      );
    }
    
    if (error.message?.includes("timeout") || error.message?.includes("timed out")) {
      return createErrorResponse(
        ErrorCode.TIMEOUT,
        "Request timed out",
        { errorMessage: error.message }
      );
    }
    
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "An error occurred while processing the query",
      { errorMessage: error.message }
    );
  }
}
