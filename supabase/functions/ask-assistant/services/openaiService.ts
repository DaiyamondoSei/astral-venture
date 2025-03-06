
// Import OpenAI API
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// OpenAI configuration constants
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini"; // Changed from gpt-4o to gpt-4o-mini as default
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;

// Benchmarking constants for evaluating model performance
const BENCHMARK_THRESHOLDS = {
  RESPONSE_TIME_MS: {
    EXCELLENT: 1500,
    GOOD: 3000,
    ACCEPTABLE: 5000
  },
  TOKEN_EFFICIENCY: {
    HIGH: 0.7,    // Ratio of useful content tokens to total tokens
    MEDIUM: 0.5,
    LOW: 0.3
  }
};

// Track rate limits to prevent API throttling
const RATE_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 50,
  CURRENT_REQUESTS: 0,
  RESET_TIME: Date.now()
};

// Content moderation types for safety checks
export type ContentModerationType = 
  | "hate"
  | "harassment" 
  | "sexual" 
  | "violence" 
  | "self_harm" 
  | "dangerous";

// Model options with associated characteristics
export type AIModel = 
  | "gpt-4o"           // High quality, higher cost, slower
  | "gpt-4o-mini";     // Good quality, lower cost, faster

// Performance metrics for benchmarking
export interface PerformanceMetrics {
  responseTimeMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: AIModel;
  costEstimate: number; // In USD
}

// Options for generating responses
export type ChatCompletionOptions = {
  model?: AIModel;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  stop?: string[];
  stream?: boolean;
};

/**
 * Calculate estimated cost based on model and token usage
 * @param model The AI model used
 * @param promptTokens Number of tokens in the prompt
 * @param completionTokens Number of tokens in the completion
 * @returns Estimated cost in USD
 */
function calculateCost(model: AIModel, promptTokens: number, completionTokens: number): number {
  const rates: Record<AIModel, {input: number, output: number}> = {
    "gpt-4o": { input: 0.00001, output: 0.00003 },     // $10/1M input, $30/1M output
    "gpt-4o-mini": { input: 0.000005, output: 0.000015 } // $5/1M input, $15/1M output
  };
  
  const modelRates = rates[model];
  return (promptTokens * modelRates.input) + (completionTokens * modelRates.output);
}

/**
 * Determines the best model to use based on query complexity and urgency
 * @param prompt The user's query
 * @param urgency Whether the response is needed quickly
 * @returns The recommended AI model
 */
export function selectOptimalModel(prompt: string, urgency: boolean = false): AIModel {
  // For urgent requests, prioritize speed with mini model
  if (urgency) {
    return "gpt-4o-mini";
  }
  
  // For complex spiritual questions, use the more capable model
  const complexityIndicators = [
    "kundalini", "transcendence", "enlightenment", "meditation technique", 
    "chakra balancing", "spiritual awakening", "energy healing",
    "why am I feeling", "explain the connection", "deeper meaning"
  ];
  
  const isComplex = complexityIndicators.some(indicator => 
    prompt.toLowerCase().includes(indicator)
  );
  
  // For complex queries, use the more powerful model
  if (isComplex) {
    return "gpt-4o";
  }
  
  // Default to mini model for better cost efficiency
  return "gpt-4o-mini";
}

/**
 * Check and update rate limiting
 * @returns Whether the request should proceed or be rate limited
 */
function checkRateLimit(): boolean {
  const now = Date.now();
  
  // Reset counter after a minute
  if (now - RATE_LIMITS.RESET_TIME > 60000) {
    RATE_LIMITS.CURRENT_REQUESTS = 0;
    RATE_LIMITS.RESET_TIME = now;
  }
  
  // Check if we've hit the limit
  if (RATE_LIMITS.CURRENT_REQUESTS >= RATE_LIMITS.MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  // Increment request counter
  RATE_LIMITS.CURRENT_REQUESTS++;
  return true;
}

/**
 * Generates a response from OpenAI's Chat Completion API
 * @param prompt The user's prompt or question
 * @param systemPrompt Optional system instructions for the model
 * @param options Additional configuration options for the API
 * @returns Generated response text and performance metrics
 */
export async function generateChatResponse(
  prompt: string,
  systemPrompt?: string,
  options?: ChatCompletionOptions
): Promise<{content: string, metrics: PerformanceMetrics}> {
  try {
    // Check rate limits to prevent API throttling
    if (!checkRateLimit()) {
      throw new Error("Rate limit exceeded. Please try again in a minute.");
    }
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    // Validate API key
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }
    
    // Default system prompt for the assistant
    const defaultSystemPrompt = systemPrompt || 
      "You are a helpful spiritual guide and meditation assistant. Provide insightful, compassionate advice about energy work, meditation, and emotional wellness. Keep responses concise and practical.";
    
    // Determine optimal model if not specified
    const model = options?.model || selectOptimalModel(prompt);
    
    // Build the messages array for the API
    const messages = [
      {
        role: "system",
        content: defaultSystemPrompt
      },
      {
        role: "user",
        content: prompt
      }
    ];
    
    // Prepare the API request body with default and custom options
    const requestBody = {
      model: model,
      messages: messages,
      temperature: options?.temperature || DEFAULT_TEMPERATURE,
      max_tokens: options?.max_tokens || DEFAULT_MAX_TOKENS,
      top_p: options?.top_p || 1,
      presence_penalty: options?.presence_penalty || 0,
      frequency_penalty: options?.frequency_penalty || 0,
      stop: options?.stop || [],
      stream: options?.stream || false
    };
    
    // Log the request (excluding sensitive data)
    console.log("OpenAI request:", {
      model: requestBody.model,
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens,
      prompt_length: prompt.length,
      streaming: requestBody.stream
    });
    
    // Start timing the request
    const startTime = Date.now();
    
    // Make the API request
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    // Calculate API response time
    const responseTime = Date.now() - startTime;
    console.log(`OpenAI API response time: ${responseTime}ms`);
    
    // Handle unsuccessful requests
    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      
      // Handle quota exceeded error specifically
      if (errorData.includes("quota") || errorData.includes("insufficient_quota")) {
        throw new Error("OpenAI API quota exceeded. Please check your billing details.");
      }
      
      throw new Error(`OpenAI API error: ${errorData}`);
    }
    
    // Parse successful response
    const responseData = await response.json();
    
    // Extract and prepare the assistant's message
    if (responseData.choices && responseData.choices.length > 0) {
      const content = responseData.choices[0].message.content;
      
      // Prepare performance metrics
      let metrics: PerformanceMetrics = {
        responseTimeMs: responseTime,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        model: model,
        costEstimate: 0
      };
      
      // Extract token usage metrics for monitoring costs
      if (responseData.usage) {
        metrics.promptTokens = responseData.usage.prompt_tokens;
        metrics.completionTokens = responseData.usage.completion_tokens;
        metrics.totalTokens = responseData.usage.total_tokens;
        metrics.costEstimate = calculateCost(model, metrics.promptTokens, metrics.completionTokens);
        
        console.log("Token usage:", {
          prompt_tokens: metrics.promptTokens,
          completion_tokens: metrics.completionTokens,
          total_tokens: metrics.totalTokens,
          estimated_cost_usd: metrics.costEstimate.toFixed(6)
        });
      }
      
      return { content, metrics };
    } else {
      throw new Error("No response generated from OpenAI");
    }
  } catch (error) {
    console.error("Error generating OpenAI response:", error);
    throw error;
  }
}

/**
 * Checks content for potential moderation violations
 * @param content Text content to check
 * @returns Object with moderation results
 */
export async function moderateContent(
  content: string
): Promise<{
  flagged: boolean;
  flaggedCategories: ContentModerationType[];
}> {
  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }
    
    // Check rate limits
    if (!checkRateLimit()) {
      console.warn("Rate limit exceeded for moderation check, proceeding without moderation");
      return {
        flagged: false,
        flaggedCategories: [],
      };
    }
    
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ input: content }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI Moderation API error: ${errorData}`);
    }
    
    const data = await response.json();
    
    // Extract moderation results
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const categories = result.categories;
      const flagged = result.flagged;
      
      // Identify flagged categories
      const flaggedCategories: ContentModerationType[] = [];
      
      if (categories.hate && result.category_scores.hate > 0.5) {
        flaggedCategories.push("hate");
      }
      
      if (categories.harassment && result.category_scores.harassment > 0.5) {
        flaggedCategories.push("harassment");
      }
      
      if (categories.sexual && result.category_scores.sexual > 0.5) {
        flaggedCategories.push("sexual");
      }
      
      if (categories["self-harm"] && result.category_scores["self-harm"] > 0.5) {
        flaggedCategories.push("self_harm");
      }
      
      if (categories.violence && result.category_scores.violence > 0.5) {
        flaggedCategories.push("violence");
      }
      
      return {
        flagged,
        flaggedCategories,
      };
    }
    
    // Default safe response if no results
    return {
      flagged: false,
      flaggedCategories: [],
    };
  } catch (error) {
    console.error("Error during content moderation:", error);
    // Default to safe in case of errors to avoid blocking legitimate content
    return {
      flagged: false,
      flaggedCategories: [],
    };
  }
}
