
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AIQueryRequest, AIQueryResponse } from "../types.ts";
import { extractInsights } from "../services/insightExtractor.ts";
import { getCachedResponse, cacheResponse } from "../services/cacheHandler.ts";
import { corsHeaders } from "../../shared/responseUtils.ts";
import { createCacheKey } from "../utils/cacheUtils.ts";
import { trackUsage } from "../services/usageTracker.ts";
import { fetchContextData, buildRichContext } from "./contextHandler.ts";
import { callOpenAI } from "./openaiHandler.ts";

/**
 * Process an AI query, with optimized caching and error handling
 */
export async function processAIQuery(user: any, req: Request): Promise<Response> {
  try {
    // Start timing for performance tracking
    const startTime = performance.now();
    
    // Parse request body
    const requestData: AIQueryRequest = await req.json();
    const { 
      query, 
      context, 
      userId, 
      reflectionId,
      options = {} 
    } = requestData;
    
    // Set defaults
    const model = options.model || "gpt-4o-mini";
    const temperature = options.temperature || 0.7;
    const maxTokens = options.maxTokens || 1000;
    const useCache = options.useCache !== false;
    const stream = options.stream || false;
    const cacheKey = options.cacheKey || createCacheKey(query, context, model);
    
    // Check cache first if caching is enabled
    if (useCache) {
      const cachedResponse = await getCachedResponse(cacheKey, stream);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Fetch context data (user profile and reflection)
    const contextData = await fetchContextData(supabaseAdmin, userId, reflectionId);
    
    // Build rich context for the AI request
    const richContext = buildRichContext(context, contextData);
    
    // Make request to OpenAI
    const openAIResponse = await callOpenAI(query, richContext, {
      model,
      temperature,
      maxTokens,
      stream,
      apiKey: OPENAI_API_KEY
    });
    
    // Handle streaming response
    if (stream) {
      const streamResponse = new Response(openAIResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream"
        }
      });
      
      // Cache the streaming response if caching is enabled
      if (useCache) {
        await cacheResponse(cacheKey, streamResponse.clone(), true);
      }
      
      return streamResponse;
    }
    
    // For non-streaming responses, process and format the data
    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      throw new Error(errorData.error?.message || "Error from OpenAI API");
    }
    
    const responseData = await openAIResponse.json();
    const answer = responseData.choices[0]?.message?.content || "";
    
    // Extract insights using a basic heuristic
    const insights = extractInsights(answer);
    
    // Calculate processing time
    const processingTime = performance.now() - startTime;
    
    // Prepare the final response
    const result: AIQueryResponse = {
      answer,
      insights,
      metrics: {
        processingTime,
        tokenUsage: responseData.usage?.total_tokens,
        model: responseData.model
      }
    };
    
    // Create response object
    const response = new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
    // Cache the response if caching is enabled
    if (useCache) {
      await cacheResponse(cacheKey, response.clone(), false);
    }
    
    // Track usage for billing/quotas if needed
    if (userId) {
      EdgeRuntime.waitUntil(
        trackUsage(supabaseAdmin, userId, {
          model,
          tokensUsed: responseData.usage?.total_tokens || 0,
          queryType: reflectionId ? "reflection_analysis" : "general_query"
        })
      );
    }
    
    return response;
  } catch (error) {
    console.error("Error processing AI query:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process AI query", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}
