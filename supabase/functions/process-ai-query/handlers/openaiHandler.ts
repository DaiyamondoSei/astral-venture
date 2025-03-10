
import { corsHeaders } from "../../shared/responseUtils.ts";

/**
 * Call the OpenAI API with improved error handling and logging
 * 
 * @param query User query text
 * @param context Additional context to aid the model
 * @param options Configuration options for the API call
 * @returns OpenAI API response
 */
export async function callOpenAI(
  query: string, 
  context: string, 
  options: {
    model: string;
    temperature: number;
    maxTokens: number;
    stream: boolean;
    apiKey: string;
  }
): Promise<Response> {
  // Prepare messages for the AI request
  const messages = [
    {
      role: "system",
      content: "You are a consciousness expansion assistant. Provide insightful, helpful responses that expand awareness. Be concise yet profound."
    }
  ];
  
  // Add context if available
  if (context) {
    messages.push({
      role: "system",
      content: `Additional context: ${context}`
    });
  }
  
  // Add the user query
  messages.push({
    role: "user",
    content: query
  });
  
  // Log the request model and settings (not the content for privacy)
  console.log(`OpenAI request: model=${options.model}, temperature=${options.temperature}, stream=${options.stream}`);
  
  try {
    // Make request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${options.apiKey}`
      },
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: options.stream
      })
    });
    
    // Log response status
    console.log(`OpenAI response status: ${response.status}`);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
      console.error("OpenAI API error:", errorData);
      
      // Create a formatted error response
      return new Response(
        JSON.stringify({
          error: errorData.error?.message || "Unknown error",
          type: "openai_api_error",
          status: response.status
        }),
        { 
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    return response;
  } catch (error) {
    // Log and format network or runtime errors
    console.error("Error calling OpenAI:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to communicate with OpenAI API",
        type: "network_error"
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
}

/**
 * Process a raw OpenAI response for non-streaming requests
 * 
 * @param response OpenAI API response
 * @returns Processed response with extracted content and metadata
 */
export async function processOpenAIResponse(response: Response): Promise<{
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}> {
  const responseData = await response.json();
  
  return {
    content: responseData.choices[0]?.message?.content || "",
    model: responseData.model || "unknown",
    usage: {
      promptTokens: responseData.usage?.prompt_tokens || 0,
      completionTokens: responseData.usage?.completion_tokens || 0,
      totalTokens: responseData.usage?.total_tokens || 0
    }
  };
}
