
import { corsHeaders } from "../../shared/responseUtils.ts";
import { getCachedResponse, cacheResponse } from "./cacheHandler.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

/**
 * Process API request with caching and error handling
 */
export async function processAIQuery(user: any, req: Request): Promise<Response> {
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
      const cachedResponse = await getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Process start time for tracking
    const startTime = Date.now();
    
    // Create system prompt
    const systemPrompt = createSystemPrompt(user);
    
    // Build prompt with context if provided
    const fullPrompt = buildPrompt(question, context);
    
    // Handle streaming requests
    if (stream) {
      return handleStreamingRequest(fullPrompt, systemPrompt, temperature, maxTokens);
    }
    
    // Generate response from OpenAI
    const responseData = await generateAIResponse(
      fullPrompt,
      systemPrompt,
      temperature,
      maxTokens
    );
    
    // Format response object
    const responseObject = formatResponseObject(
      responseData, 
      reflectionIds, 
      startTime
    );
    
    // Create response
    const response = new Response(
      JSON.stringify(responseObject),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
    // Store in cache if we have a valid cache key
    if (cacheKey) {
      await cacheResponse(cacheKey, responseObject);
    }
    
    return response;
    
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

/**
 * Creates a personalized system prompt
 */
function createSystemPrompt(user: any): string {
  return `You are an AI assistant specializing in personal growth, 
  spiritual exploration, and emotional intelligence. Provide thoughtful, 
  non-judgmental responses that help users gain deeper insights into their 
  reflections and life journey. The user's ID is ${user.id}.`;
}

/**
 * Build the full prompt with context if available
 */
function buildPrompt(question: string, context: string): string {
  if (context) {
    return `Context: ${context}\n\nQuestion: ${question}`;
  }
  return question;
}

/**
 * Generate AI response from OpenAI
 */
async function generateAIResponse(
  prompt: string,
  systemPrompt: string,
  temperature: number,
  maxTokens: number
): Promise<any> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing");
  }
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: temperature
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
  }
  
  return await response.json();
}

/**
 * Format the response object with metrics
 */
function formatResponseObject(
  openAIData: any, 
  reflectionIds: string[],
  startTime: number
): any {
  const aiContent = openAIData.choices[0].message.content;
  const processingTime = Date.now() - startTime;
  
  return {
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
}

/**
 * Handle streaming requests (placeholder implementation)
 */
function handleStreamingRequest(
  prompt: string,
  systemPrompt: string,
  temperature: number,
  maxTokens: number
): Response {
  // Streaming implementation would go here
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
