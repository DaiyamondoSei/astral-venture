
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchUserContext, buildContextualizedPrompt } from "./handlers/contextHandler.ts";
import { createInsightPrompt, createEmotionalAnalysisPrompt } from "./utils/promptUtils.ts";
import { generateChatResponse, selectOptimalModel } from "./services/openai/index.ts";
import { processAIResponse } from "./handlers/aiResponseHandler.ts";
import { getCachedResponse, cacheResponse } from "./handlers/cacheHandler.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
function handleCorsRequest(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Create Supabase client
function createSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Main handler for AI processing
async function handleRequest(req: Request): Promise<Response> {
  try {
    // Process start time for tracking
    const startTime = Date.now();

    const { query, reflectionId, reflectionContent, cacheKey } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization is required" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    
    // Get the user from the token
    const supabase = createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Check if we have a cached response
    if (cacheKey) {
      const cachedResponse = await getCachedResponse(cacheKey, false);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Fetch user context
    const userContext = await fetchUserContext(user.id);
    
    // Build the prompt based on the query type
    let prompt = query;
    let systemPrompt = "You are a helpful AI assistant specialized in consciousness, meditation, and personal growth.";
    
    // If this is a reflection analysis
    if (reflectionContent) {
      prompt = createEmotionalAnalysisPrompt(reflectionContent);
      systemPrompt += " You provide empathetic, insightful analysis of emotional reflections.";
    } else {
      // For general queries, build a contextualized prompt
      prompt = buildContextualizedPrompt(query, userContext);
    }
    
    // Determine the optimal model for this query
    const model = selectOptimalModel(prompt);
    
    // Generate response from OpenAI
    const { content: aiResponse, metrics } = await generateChatResponse(
      prompt,
      systemPrompt,
      { model }
    );
    
    // Process the AI response
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
    
    return response;
  } catch (error) {
    console.error("Error in process-ai-query:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while processing the query",
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

// Entry point
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }
  
  // Process the request
  return handleRequest(req);
});
