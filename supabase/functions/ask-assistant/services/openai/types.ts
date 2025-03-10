
/**
 * Types for OpenAI API integration
 */

// Available OpenAI models
export type AIModel = 
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4"
  | "gpt-3.5-turbo";

// Content moderation categories
export type ContentModerationType = 
  | "hate"
  | "hate/threatening"
  | "harassment"
  | "harassment/threatening"
  | "self-harm"
  | "self-harm/intent"
  | "self-harm/instructions"
  | "sexual"
  | "sexual/minors"
  | "violence"
  | "violence/graphic";

// Result from content moderation
export interface ModerationResult {
  allowed: boolean;
  flags: ContentModerationType[];
  flaggedCategories: Record<ContentModerationType, boolean>;
  categoryScores: Record<ContentModerationType, number>;
}

// Chat completion options
export interface ChatOptions {
  model?: AIModel;
  temperature?: number;
  max_tokens?: number;
  function_call?: string | { name: string };
  functions?: Array<{
    name: string;
    description?: string;
    parameters: Record<string, any>;
  }>;
}

// Chat completion metrics
export interface ChatMetrics {
  model: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  latency: number;
}

// Raw response from OpenAI Chat Completion API
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      function_call?: {
        name: string;
        arguments: string;
      };
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Config for streaming responses
export interface StreamConfig {
  model: AIModel;
  temperature?: number;
  max_tokens?: number;
}
