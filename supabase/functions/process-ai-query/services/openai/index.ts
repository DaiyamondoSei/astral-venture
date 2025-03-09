
import { cleanupCache } from "../../handlers/cacheHandler.ts";

/**
 * Helper for OpenAI API communication
 */

const API_URL = "https://api.openai.com/v1/chat/completions";

// Supported OpenAI models with context limits and costs
const MODELS = {
  "gpt-4o-mini": {
    maxTokens: 16000,
    costPer1KTokens: 0.015,
    outputCostPer1KTokens: 0.06
  },
  "gpt-4o": {
    maxTokens: 32000,
    costPer1KTokens: 0.03,
    outputCostPer1KTokens: 0.12
  }
};

/**
 * Generate a chat response using OpenAI API
 */
export async function generateChatResponse(
  prompt: string, 
  systemPrompt: string,
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}
) {
  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }
    
    const model = options.model || "gpt-4o-mini";
    const temperature = options.temperature || 0.7;
    const maxTokens = options.max_tokens || 1000;
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
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
        temperature,
        max_tokens: maxTokens
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    
    // Calculate token usage
    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;
    const totalTokens = data.usage?.total_tokens || 0;
    
    return {
      content: data.choices[0].message.content,
      metrics: {
        promptTokens,
        completionTokens,
        totalTokens,
        model
      }
    };
  } catch (error) {
    console.error("Error in generateChatResponse:", error);
    
    // Attempt to clean cache if there's an error
    await cleanupCache();
    
    throw error;
  }
}

/**
 * Select the optimal model based on message complexity
 */
export function selectOptimalModel(message: string): string {
  const messageLength = message.length;
  
  // Use the more capable model for longer messages
  if (messageLength > 1000) {
    return "gpt-4o";
  }
  
  // Default to the cheaper model for most queries
  return "gpt-4o-mini";
}

/**
 * Calculate estimated cost for API usage
 */
export function calculateEstimatedCost(
  promptTokens: number,
  completionTokens: number,
  model: string
): number {
  const modelConfig = MODELS[model as keyof typeof MODELS] || MODELS["gpt-4o-mini"];
  
  const promptCost = (promptTokens / 1000) * modelConfig.costPer1KTokens;
  const completionCost = (completionTokens / 1000) * modelConfig.outputCostPer1KTokens;
  
  return promptCost + completionCost;
}
