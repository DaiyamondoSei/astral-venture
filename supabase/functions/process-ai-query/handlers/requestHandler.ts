
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { corsHeaders, createResponse, createErrorResponse } from "../../shared/responseUtils.ts";
import { extractInsights } from "../services/insightExtractor.ts";
import { getCachedResponse, cacheResponse } from "../services/cacheHandler.ts";
import { createCacheKey } from "../utils/cacheUtils.ts";
import { trackUsage } from "../services/usageTracker.ts";
import { fetchContextData, buildRichContext } from "./contextHandler.ts";
import { callOpenAI } from "./openaiHandler.ts";

// Define the request interface
interface AIQueryRequest {
  query: string;
  context?: string;
  userId?: string;
  reflectionId?: string;
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    useCache?: boolean;
    stream?: boolean;
    cacheKey?: string;
    cacheTtl?: number;
  };
}

// Define the response interface
interface AIQueryResponse {
  answer: string;
  insights: any[];
  metrics: {
    processingTime: number;
    tokenUsage?: number;
    model?: string;
  };
}

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
    
    // Set defaults with more options for flexibility
    const model = options.model || "gpt-4o-mini";
    const temperature = options.temperature || 0.7;
    const maxTokens = options.maxTokens || 1000;
    const useCache = options.useCache !== false;
    const stream = options.stream || false;
    const cacheKey = options.cacheKey || createCacheKey(query, context, model);
    const cacheTtl = options.cacheTtl || 30 * 60 * 1000; // 30 minutes default TTL
    
    // Check cache first if caching is enabled
    if (useCache) {
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
      return createErrorResponse("OpenAI API key not configured", null, 500);
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
        await cacheResponse(cacheKey, streamResponse.clone(), true, cacheTtl);
      }
      
      return streamResponse;
    }
    
    // For non-streaming responses, process and format the data
    const responseData = await openAIResponse.json();
    const answer = responseData.choices[0]?.message?.content || "";
    
    // Calculate processing time
    const processingTime = performance.now() - startTime;
    
    // Extract insights using improved extractInsights function
    const insights = extractInsights(answer);
    
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
    const response = createResponse(result);
    
    // Cache the response if caching is enabled
    if (useCache) {
      await cacheResponse(cacheKey, response.clone(), false, cacheTtl);
    }
    
    // Track usage for billing/quotas if needed (as a background task)
    if (userId) {
      EdgeRuntime.waitUntil(
        trackUsage(supabaseAdmin, userId, {
          model,
          tokensUsed: responseData.usage?.total_tokens || 0,
          queryType: reflectionId ? "reflection_analysis" : "general_query",
          processingTime,
          answerLength: answer.length,
          insightsCount: insights.length,
          metadata: {
            queryLength: query.length,
            hasReflection: Boolean(reflectionId)
          }
        })
      );
    }
    
    return response;
  } catch (error) {
    console.error("Error processing AI query:", error);
    return createErrorResponse("Failed to process AI query", error.message);
  }
}
