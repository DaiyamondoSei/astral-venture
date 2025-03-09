
// Import Deno standard library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Import shared utilities
import { 
  corsHeaders,
  handleCorsRequest
} from "../shared/responseUtils.ts";

import { withAuth } from "../shared/authUtils.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// In-memory cache for AI responses
const responseCache = new Map<string, {
  response: any,
  timestamp: number,
  expiresAt: number
}>();

// Default TTL for cached responses (10 minutes)
const DEFAULT_CACHE_TTL = 10 * 60 * 1000;

// Maximum size for cache to prevent memory issues
const MAX_CACHE_SIZE = 100;

// Clean up expired cache entries
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

// Process API request with caching
async function processAIRequest(user: any, req: Request): Promise<Response> {
  try {
    // Parse request body
    const { 
      question, 
      context = "",
      reflectionIds = [], 
      cacheKey = "",
      maxTokens = 1200,
      temperature = 0.7,
      stream = false
    } = await req.json();
    
    // Validate required parameters
    if (!question) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameter: question" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }
    
    // Check if we have a valid cache key and cached response
    if (cacheKey) {
      const cached = responseCache.get(cacheKey);
      if (cached && Date.now() <= cached.expiresAt) {
        console.log("Cache hit:", cacheKey);
        return new Response(
          JSON.stringify({ 
            ...cached.response,
            cached: true
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }
    
    // Calculate processing hash for internal caching
    const processingHash = `${user.id}:${question}:${reflectionIds.join(',')}`;
    
    // Handle streaming requests
    if (stream) {
      // Streaming implementation not shown for brevity
      // Would create a streaming response using ReadableStream
      return new Response(
        JSON.stringify({ 
          error: "Streaming not implemented in this example" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 501 
        }
      );
    }
    
    // Process start time for tracking
    const startTime = Date.now();
    
    // Create system prompt
    const systemPrompt = `You are an AI assistant specializing in personal growth, 
    spiritual exploration, and emotional intelligence. Provide thoughtful, 
    non-judgmental responses that help users gain deeper insights into their 
    reflections and life journey. The user's ID is ${user.id}.`;
    
    // Build prompt with context if provided
    let fullPrompt = question;
    if (context) {
      fullPrompt = `Context: ${context}\n\nQuestion: ${question}`;
    }
    
    // Make request to OpenAI
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: fullPrompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      })
    });
    
    // Parse OpenAI response
    const openAIData = await openAIResponse.json();
    
    // Check for errors
    if (openAIData.error) {
      console.error("OpenAI API error:", openAIData.error);
      return new Response(
        JSON.stringify({ 
          error: openAIData.error.message || "Error processing AI request"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }
    
    // Extract response content
    const aiContent = openAIData.choices[0].message.content;
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Create response object
    const responseObject = {
      answer: aiContent,
      reflectionId: reflectionIds[0] || null,
      processingTime,
      meta: {
        model: openAIData.model,
        tokenUsage: openAIData.usage?.total_tokens || 0,
        finishReason: openAIData.choices[0].finish_reason,
        version: "1.0"
      }
    };
    
    // Store in cache if we have a valid cache key
    if (cacheKey) {
      // Clean up cache first
      cleanupCache();
      
      responseCache.set(cacheKey, {
        response: responseObject,
        timestamp: Date.now(),
        expiresAt: Date.now() + DEFAULT_CACHE_TTL
      });
      
      console.log(`Added to cache with key: ${cacheKey}, cache size: ${responseCache.size}`);
    }
    
    // Return response
    return new Response(
      JSON.stringify(responseObject),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in AI processing:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error occurred"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
}

// Entry point for the edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  // Route for clearing cache (admin only)
  if (req.url.includes("/clear-cache")) {
    // This would normally have additional auth checks
    responseCache.clear();
    return new Response(
      JSON.stringify({ success: true, message: "Cache cleared" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Process the request with authentication
  return withAuth(req, processAIRequest);
});
