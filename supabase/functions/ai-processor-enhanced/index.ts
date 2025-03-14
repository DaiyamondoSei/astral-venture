
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Response utility for consistent formatting
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Utility for creating success responses
function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Utility for creating error responses
function createErrorResponse(message: string, details?: any, status = 500) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Cache utilities
const CACHE_DURATION = 3600; // 1 hour in seconds
const memoryCache = new Map<string, { data: any; expires: number }>();

async function getCachedResponse(key: string): Promise<any | null> {
  // Check memory cache first
  const cached = memoryCache.get(key);
  const now = Date.now();
  
  if (cached && cached.expires > now) {
    console.log(`Cache hit for key: ${key}`);
    return cached.data;
  }
  
  // Remove expired cache entries
  if (cached && cached.expires <= now) {
    memoryCache.delete(key);
  }
  
  return null;
}

function cacheResponse(key: string, data: any): void {
  const expires = Date.now() + CACHE_DURATION * 1000;
  memoryCache.set(key, { data, expires });
  console.log(`Cached response for key: ${key}`);
}

// Process query with OpenAI
async function processWithOpenAI(
  query: string,
  model: string = "gpt-4o-mini",
  temperature: number = 0.7,
  maxTokens: number = 1000
) {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in consciousness, energy work, and personal growth."
        },
        {
          role: "user",
          content: query
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
  return data.choices[0].message.content;
}

// Process emotional analysis for reflection content
async function processEmotionalAnalysis(
  reflectionContent: string,
  userId?: string
) {
  const prompt = `
    Analyze the following reflection entry for emotional themes, chakra connections, and growth insights:
    
    Reflection: "${reflectionContent}"
    
    Provide the following structured analysis:
    1. Primary emotions identified
    2. Chakra centers most active based on the content
    3. Growth opportunities and insights
    4. Personalized practice recommendations
  `;

  const result = await processWithOpenAI(
    prompt,
    "gpt-4o",
    0.7,
    1500
  );

  // If user is authenticated, store the analysis
  if (userId) {
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Store analysis result
      const { error } = await supabase
        .from("reflection_insights")
        .insert({
          user_id: userId,
          reflection_content: reflectionContent,
          analysis_result: result,
          created_at: new Date().toISOString(),
        });
        
      if (error) {
        console.error("Error storing reflection analysis:", error);
      }
    } catch (error) {
      console.error("Failed to connect to database:", error);
    }
  }

  return { analysisResult: result };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, model, temperature, maxTokens, userId, reflectionContent, useCache } = await req.json();
    
    // Process start time for performance tracking
    const startTime = performance.now();
    
    // Generate cache key if caching is enabled
    const cacheKey = useCache ? 
      `${action}:${JSON.stringify({ query, model, reflectionContent })}` : 
      null;
    
    // Check cache if enabled
    if (cacheKey) {
      const cachedResult = await getCachedResponse(cacheKey);
      if (cachedResult) {
        return createSuccessResponse({
          result: cachedResult,
          cached: true,
          processingTime: 0
        });
      }
    }
    
    // Process based on action type
    let result;
    
    switch (action) {
      case "query":
        if (!query) {
          return createErrorResponse("Query is required", null, 400);
        }
        result = await processWithOpenAI(
          query,
          model || "gpt-4o-mini",
          temperature || 0.7,
          maxTokens || 1000
        );
        break;
        
      case "analyze_reflection":
        if (!reflectionContent) {
          return createErrorResponse("Reflection content is required", null, 400);
        }
        result = await processEmotionalAnalysis(reflectionContent, userId);
        break;
        
      default:
        return createErrorResponse("Invalid action specified", null, 400);
    }
    
    // Calculate processing time
    const processingTime = performance.now() - startTime;
    
    // Cache the result if caching is enabled
    if (cacheKey) {
      cacheResponse(cacheKey, result);
    }
    
    return createSuccessResponse({
      result,
      cached: false,
      processingTime
    });
  } catch (error) {
    console.error("Error in ai-processor-enhanced:", error);
    
    return createErrorResponse(
      error instanceof Error ? error.message : "Unknown error occurred",
      { stack: error instanceof Error ? error.stack : undefined }
    );
  }
});
