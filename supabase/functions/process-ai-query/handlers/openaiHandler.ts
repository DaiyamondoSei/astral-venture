
/**
 * OpenAI integration handler for AI queries
 */

import { corsHeaders } from "../../shared/responseUtils.ts";

interface OpenAIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  apiKey: string;
}

/**
 * Call OpenAI API with the query and context
 * 
 * @param query - User query
 * @param context - Context information
 * @param options - OpenAI API options
 * @returns Response from OpenAI
 */
export async function callOpenAI(
  query: string,
  context: string,
  options: OpenAIOptions
): Promise<Response> {
  const { 
    model = "gpt-4o-mini", 
    temperature = 0.7, 
    maxTokens = 1000, 
    stream = false,
    apiKey 
  } = options;
  
  const systemPrompt = `You are a spiritual guide and meditation assistant with expertise in energy work, 
chakra balancing, and emotional wellness. Your goal is to provide insightful, 
compassionate responses that help users on their spiritual journey.

Format your responses in clear paragraphs with occasional emphasis for readability. 
When appropriate, suggest 1-3 specific practices that might help the user.

${context ? 'Here is additional context about the user:\n' + context : ''}`;
  
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  };
  
  const body = JSON.stringify({
    model,
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: query
      }
    ],
    temperature,
    max_tokens: maxTokens,
    stream
  });
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers,
      body
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      
      return new Response(
        JSON.stringify({ error: errorData.error || "OpenAI API error" }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    if (stream) {
      // Return the stream directly
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream"
        }
      });
    }
    
    return response;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Error calling OpenAI" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

/**
 * Process OpenAI response into a standardized format
 * 
 * @param response - Response from OpenAI API
 * @returns Processed response content and usage metrics
 */
export async function processOpenAIResponse(
  response: Response
): Promise<{
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}> {
  const data = await response.json();
  
  const content = data.choices?.[0]?.message?.content || "";
  
  const usage = {
    promptTokens: data.usage?.prompt_tokens || 0,
    completionTokens: data.usage?.completion_tokens || 0,
    totalTokens: data.usage?.total_tokens || 0
  };
  
  return { content, usage };
}
