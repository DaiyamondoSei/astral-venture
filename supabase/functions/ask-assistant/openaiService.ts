
// Import OpenAI API
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// OpenAI configuration constants
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o";
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;

// Content moderation types for safety checks
export type ContentModerationType = 
  | "hate"
  | "harassment" 
  | "sexual" 
  | "violence" 
  | "self_harm" 
  | "dangerous";

// Options for generating responses
export type ChatCompletionOptions = {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  stop?: string[];
};

/**
 * Generates a response from OpenAI's Chat Completion API
 * @param prompt The user's prompt or question
 * @param systemPrompt Optional system instructions for the model
 * @param options Additional configuration options for the API
 * @returns Generated response text
 */
export async function generateChatResponse(
  prompt: string,
  systemPrompt?: string,
  options?: ChatCompletionOptions
): Promise<string> {
  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    // Validate API key
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }
    
    // Default system prompt for the assistant
    const defaultSystemPrompt = systemPrompt || 
      "You are a helpful spiritual guide and meditation assistant. Provide insightful, compassionate advice about energy work, meditation, and emotional wellness. Keep responses concise and practical.";
    
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
      model: options?.model || DEFAULT_MODEL,
      messages: messages,
      temperature: options?.temperature || DEFAULT_TEMPERATURE,
      max_tokens: options?.max_tokens || DEFAULT_MAX_TOKENS,
      top_p: options?.top_p || 1,
      presence_penalty: options?.presence_penalty || 0,
      frequency_penalty: options?.frequency_penalty || 0,
      stop: options?.stop || [],
    };
    
    // Log the request (excluding sensitive data)
    console.log("OpenAI request:", {
      model: requestBody.model,
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens,
      prompt_length: prompt.length,
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
      
      throw new Error(`OpenAI API error: ${errorData}`);
    }
    
    // Parse successful response
    const responseData = await response.json();
    
    // Extract and return the assistant's message
    if (responseData.choices && responseData.choices.length > 0) {
      const content = responseData.choices[0].message.content;
      
      // Log token usage metrics for monitoring costs
      if (responseData.usage) {
        console.log("Token usage:", {
          prompt_tokens: responseData.usage.prompt_tokens,
          completion_tokens: responseData.usage.completion_tokens,
          total_tokens: responseData.usage.total_tokens,
        });
      }
      
      return content;
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
