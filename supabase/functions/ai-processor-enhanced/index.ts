
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize OpenAI API with configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";

// Initialize Supabase client for server-side operations
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are not configured");
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Process AI requests with various models and caching
async function processAIRequest(prompt: string, options: any = {}) {
  const { 
    model = "gpt-4o-mini", 
    temperature = 0.7,
    maxTokens = 1000,
    useCache = true,
    cacheKey = ""
  } = options;

  // Cache key generation
  const effectiveCacheKey = cacheKey || `${model}:${prompt.substring(0, 100).replace(/\s+/g, '-').toLowerCase()}`;
  
  // Check cache first if enabled
  if (useCache) {
    const supabase = getSupabaseClient();
    
    // Create unique cache key based on prompt+model
    try {
      const { data: cachedResponses, error } = await supabase
        .from('ai_response_cache')
        .select('*')
        .eq('cache_key', effectiveCacheKey)
        .maybeSingle();
      
      if (!error && cachedResponses) {
        console.log("Cache hit for:", effectiveCacheKey);
        return {
          ...cachedResponses.response_data,
          cached: true,
          processingTime: 0
        };
      }
    } catch (error) {
      // If there's a cache error, we'll continue with API call
      console.error("Cache retrieval error:", error);
    }
  }

  // No cached result, so we make API call
  const startTime = performance.now();
  
  // Validate OpenAI API key
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    // Prepare request for OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a helpful, spiritual assistant specializing in chakra energy, meditation, and holistic wellness."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    const result = {
      response: data.choices[0].message.content,
      metrics: {
        tokenUsage: (data.usage?.total_tokens || 0),
        promptTokens: (data.usage?.prompt_tokens || 0),
        completionTokens: (data.usage?.completion_tokens || 0),
        processingTime
      },
      model: data.model,
      processingTime
    };

    // Store in cache if caching is enabled
    if (useCache) {
      try {
        const supabase = getSupabaseClient();
        await supabase
          .from('ai_response_cache')
          .upsert({
            cache_key: effectiveCacheKey,
            prompt,
            model,
            response_data: result,
            created_at: new Date().toISOString()
          });
      } catch (error) {
        // If caching fails, we still want to return the result
        console.error("Cache storage error:", error);
      }
    }

    return result;
  } catch (error) {
    console.error("AI processing error:", error);
    throw error;
  }
}

// Process AI reflection analysis
async function processReflectionAnalysis(reflectionId: string, userId: string, query: string) {
  try {
    const supabase = getSupabaseClient();
    
    // Get the reflection content
    const { data: reflection, error } = await supabase
      .from('energy_reflections')
      .select('*')
      .eq('id', reflectionId)
      .eq('user_id', userId)
      .single();
    
    if (error || !reflection) {
      throw new Error(`Reflection not found or unauthorized access`);
    }
    
    // Enhanced system prompt with context
    const systemPrompt = `
      You are an AI spiritual guide providing insights based on user reflections.
      
      Reflection content: "${reflection.content}"
      
      Analyze this reflection and respond to the following query with deep spiritual insights.
      Focus on chakra energy, emotional patterns, and personalized guidance.
    `;
    
    // Process the analysis with OpenAI
    const result = await processAIRequest(
      `${systemPrompt}\n\nUser query: ${query}`, 
      { 
        model: "gpt-4o-mini",
        temperature: 0.7,
        useCache: true,
        cacheKey: `reflection-analysis:${reflectionId}:${query.substring(0, 50).replace(/\s+/g, '-').toLowerCase()}`
      }
    );
    
    return {
      ...result,
      reflectionContext: {
        id: reflection.id,
        content: reflection.content.substring(0, 100) + '...'
      }
    };
  } catch (error) {
    console.error("Reflection analysis error:", error);
    throw error;
  }
}

// Handle HTTP requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const { query, context, reflectionId, userId, options } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    let result;
    
    // Process request based on context
    if (context === 'reflection' && reflectionId && userId) {
      result = await processReflectionAnalysis(reflectionId, userId, query);
    } else {
      // Standard AI processing
      result = await processAIRequest(query, options);
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Request processing error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unknown error occurred",
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
