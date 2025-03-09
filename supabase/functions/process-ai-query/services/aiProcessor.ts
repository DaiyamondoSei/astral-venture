
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCachedResponse, cacheResponse } from "./cacheHandler.ts";
import { corsHeaders } from "../../shared/responseUtils.ts";

// Types for AI query processing
interface AIQueryRequest {
  query: string;
  context?: string;
  userId?: string;
  reflectionId?: string;
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    useCache?: boolean;
    cacheKey?: string;
  }
}

interface AIQueryResponse {
  answer: string;
  insights?: any[];
  metrics?: {
    processingTime: number;
    tokenUsage?: number;
    model?: string;
  }
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
    
    // Get additional user context if userId is provided
    let userContextData = {};
    if (userId) {
      try {
        const { data: userProfile } = await supabaseAdmin
          .from("user_profiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (userProfile) {
          userContextData = {
            userLevel: userProfile.astral_level,
            energyPoints: userProfile.energy_points
          };
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
    
    // Get reflection data if reflectionId is provided
    let reflectionData = {};
    if (reflectionId) {
      try {
        const { data: reflection } = await supabaseAdmin
          .from("energy_reflections")
          .select("*")
          .eq("id", reflectionId)
          .single();
        
        if (reflection) {
          reflectionData = {
            reflectionContent: reflection.content,
            dominantEmotion: reflection.dominant_emotion,
            emotionalDepth: reflection.emotional_depth,
            chakrasActivated: reflection.chakras_activated
          };
        }
      } catch (error) {
        console.error("Error fetching reflection:", error);
      }
    }
    
    // Build rich context for the AI request
    const richContext = `
      ${context || ""}
      ${Object.keys(userContextData).length > 0 ? `User Information: ${JSON.stringify(userContextData)}` : ""}
      ${Object.keys(reflectionData).length > 0 ? `Reflection Information: ${JSON.stringify(reflectionData)}` : ""}
    `.trim();
    
    // Prepare messages for the AI request
    const messages = [
      {
        role: "system",
        content: "You are a consciousness expansion assistant. Provide insightful, helpful responses that expand awareness. Be concise yet profound."
      }
    ];
    
    // Add context if available
    if (richContext) {
      messages.push({
        role: "system",
        content: `Additional context: ${richContext}`
      });
    }
    
    // Add the user query
    messages.push({
      role: "user",
      content: query
    });
    
    // Make request to OpenAI
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream
      })
    });
    
    // Handle streaming response
    if (stream) {
      // For streaming, just pipe the response through
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

/**
 * Create a cache key from query parameters
 */
function createCacheKey(query: string, context?: string, model?: string): string {
  const normalizedQuery = query.trim().toLowerCase();
  const contextHash = context ? hashString(context) : "";
  const modelInfo = model || "default";
  
  return `query_${hashString(normalizedQuery)}_ctx_${contextHash}_model_${modelInfo}`;
}

/**
 * Simple string hashing function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Extract insights from an AI response
 */
function extractInsights(text: string): any[] {
  const insights = [];
  
  // Look for patterns that might indicate insights
  // 1. Numbered or bulleted lists
  const listItemRegex = /(?:^|\n)(?:\d+\.\s|\*\s|-\s)(.+)(?:\n|$)/g;
  let match;
  while ((match = listItemRegex.exec(text)) !== null) {
    insights.push({
      type: "point",
      content: match[1].trim()
    });
  }
  
  // 2. Look for paragraphs that contain insight-like keywords
  const paragraphs = text.split(/\n\n+/);
  const insightKeywords = [
    "important", "key", "significant", "essential", "critical",
    "remember", "note", "consider", "insight", "reflection"
  ];
  
  paragraphs.forEach(paragraph => {
    const lowerPara = paragraph.toLowerCase();
    if (insightKeywords.some(keyword => lowerPara.includes(keyword))) {
      if (!insights.some(i => i.content === paragraph.trim())) {
        insights.push({
          type: "paragraph",
          content: paragraph.trim()
        });
      }
    }
  });
  
  return insights;
}

/**
 * Track AI usage for analytics
 */
async function trackUsage(supabase: any, userId: string, usageData: any): Promise<void> {
  try {
    await supabase
      .from("ai_usage")
      .insert({
        user_id: userId,
        model: usageData.model,
        tokens_used: usageData.tokensUsed,
        query_type: usageData.queryType,
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error("Error tracking AI usage:", error);
  }
}
