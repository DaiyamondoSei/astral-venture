
/**
 * OpenAI chat completion service
 */
import type { 
  AIModel, 
  ChatOptions, 
  ChatMetrics, 
  ChatCompletionResponse 
} from "./types.ts";

/**
 * Generate a chat completion response from OpenAI
 * 
 * @param messages - Array of chat messages
 * @param options - Configuration options
 * @returns Response content and metrics
 */
export async function generateChatResponse(
  messages: Array<{ role: string; content: string; }>,
  options?: ChatOptions
): Promise<{
  content: string;
  metrics: ChatMetrics;
  functionCall?: { name: string; arguments: string; }
}> {
  const startTime = performance.now();
  
  // Get API key from environment
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  // Set up default options
  const model = options?.model || "gpt-4o-mini";
  const temperature = options?.temperature ?? 0.7;
  const max_tokens = options?.max_tokens ?? 1000;
  
  // Prepare request body
  const requestBody: Record<string, any> = {
    model,
    messages,
    temperature,
    max_tokens
  };
  
  // Add function calling if specified
  if (options?.function_call) {
    requestBody.function_call = options.function_call;
  }
  
  if (options?.functions) {
    requestBody.functions = options.functions;
  }
  
  try {
    // Make request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // Handle errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    // Parse response
    const data = await response.json() as ChatCompletionResponse;
    const firstChoice = data.choices[0];
    
    if (!firstChoice) {
      throw new Error("No completion choices returned");
    }
    
    // Calculate latency
    const latency = performance.now() - startTime;
    
    // Extract content and metrics
    const content = firstChoice.message.content || "";
    const functionCall = firstChoice.message.function_call;
    
    const metrics: ChatMetrics = {
      model: data.model,
      totalTokens: data.usage.total_tokens,
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      latency
    };
    
    // Return content and metrics (and function call if present)
    return {
      content,
      metrics,
      ...(functionCall && { functionCall })
    };
  } catch (error) {
    console.error("Error in chat completion:", error);
    throw error;
  }
}
