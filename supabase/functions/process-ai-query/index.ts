
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

import { 
  corsHeaders, 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode,
  validateRequiredParameters
} from "../shared/responseUtils.ts";

import { fetchContextData, buildRichContext } from "./handlers/contextHandler.ts";
import { callOpenAI, processOpenAIResponse } from "./handlers/openaiHandler.ts";
import { processAIResponse } from "./handlers/aiResponseHandler.ts";
import { getCachedResponse, cacheResponse } from "./handlers/cacheHandler.ts";
import { createCacheKey } from "../shared/cacheUtils.ts";

// Main entry point for edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    const { 
      reflectionId, 
      reflectionContent, 
      model = "gpt-4o-mini",
      temperature = 0.7,
      maxTokens = 1000,
      stream = false,
      useCache = true,
      cacheKey: userProvidedCacheKey
    } = requestData;

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    let userId = null;
    
    if (authHeader) {
      try {
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Get the user ID from the auth token
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabase.auth.getUser(token);
        userId = data?.user?.id;
      } catch (error) {
        console.error("Auth error:", error);
      }
    }

    // Generate cache key if not provided
    const cacheKey = userProvidedCacheKey || 
      createCacheKey(query, reflectionContent || null, model);

    // Check cache if enabled
    if (useCache) {
      console.log(`Checking cache for key: ${cacheKey}`);
      const cachedResponse = await getCachedResponse(cacheKey, stream);
      if (cachedResponse) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return cachedResponse;
      }
      console.log(`Cache miss for key: ${cacheKey}`);
    }

    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        "OpenAI API key is not configured",
        null,
        500
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user context for more relevant responses
    console.log(`Fetching context for user: ${userId}`);
    const userContext = await fetchContextData(
      supabase,
      userId,
      reflectionId
    );
    
    // Build the prompt based on the query type
    let contextualizedPrompt = query;
    
    // If this is a reflection analysis, we need special handling
    if (reflectionContent) {
      console.log("Building analysis prompt for reflection");
      contextualizedPrompt = `Please analyze this personal reflection: "${reflectionContent}"`;
    }
    
    // Create rich context for the AI request
    const richContext = buildRichContext(
      reflectionContent ? "This is a reflection analysis request" : undefined,
      userContext
    );
    
    // Make request to OpenAI
    console.log(`Calling OpenAI with model: ${model}`);
    const openAIResponse = await callOpenAI(
      contextualizedPrompt, 
      richContext, 
      {
        model,
        temperature,
        maxTokens,
        stream,
        apiKey: OPENAI_API_KEY
      }
    );
    
    // Handle streaming response
    if (stream) {
      console.log("Processing streaming response");
      const streamResponse = new Response(openAIResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream"
        }
      });
      
      // Cache the streaming response if caching is enabled
      if (useCache) {
        console.log(`Caching streaming response with key: ${cacheKey}`);
        await cacheResponse(cacheKey, streamResponse.clone(), true);
      }
      
      return streamResponse;
    }
    
    // For non-streaming responses, process and format the data
    console.log("Processing non-streaming response");
    
    // Process the OpenAI response
    const { content, usage } = await processOpenAIResponse(openAIResponse);
    
    // Process the AI response
    const response = await processAIResponse(
      content,
      reflectionId,
      startTime,
      model,
      usage.totalTokens
    );
    
    // Cache the response if caching is enabled
    if (useCache) {
      console.log(`Caching response with key: ${cacheKey}`);
      await cacheResponse(cacheKey, response.clone(), false);
    }
    
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
});
