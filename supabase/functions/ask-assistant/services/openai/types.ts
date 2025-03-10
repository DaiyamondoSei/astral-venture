
/**
 * Types for OpenAI API integration
 */

// Supported AI models
export type AIModel = 
  | "gpt-4o" 
  | "gpt-4o-mini"
  | "gpt-4-turbo"
  | "gpt-4-1106-preview"
  | "gpt-4-vision-preview" 
  | "gpt-3.5-turbo";

// Options for generating chat responses
export interface ChatOptions {
  model?: AIModel;
  temperature?: number;
  max_tokens?: number;
  function_call?: 'auto' | 'none' | { name: string };
  functions?: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }>;
}

// Chat response metrics
export interface ChatMetrics {
  model: string;
  totalTokens: number;
  promptTokens?: number;
  completionTokens?: number;
  latency?: number;
}

// Content moderation types
export type ContentModerationType = 
  | "hate" 
  | "hate/threatening" 
  | "self-harm" 
  | "sexual" 
  | "sexual/minors" 
  | "violence" 
  | "violence/graphic";

// Content moderation result
export interface ModerationResult {
  allowed: boolean;
  flags: ContentModerationType[];
  flaggedCategories: Record<ContentModerationType, boolean>;
  categoryScores: Record<ContentModerationType, number>;
}

// Streaming chat message
export interface StreamingMessage {
  content: string;
  role: "assistant" | "user" | "system";
  finished: boolean;
}

// Function call type
export interface FunctionCall {
  name: string;
  arguments: string;
}

// OpenAI function calling result
export interface FunctionCallResult {
  function_call: FunctionCall;
  role: "assistant";
  content: null;
}

// OpenAI API error 
export interface OpenAIError {
  message: string;
  type: string;
  param?: string;
  code?: string;
}

// Chat completion choice
export interface ChatCompletionChoice {
  index: number;
  message: {
    role: "assistant";
    content: string | null;
    function_call?: FunctionCall;
  };
  finish_reason: "stop" | "length" | "function_call";
}

// Chat completion response
export interface ChatCompletionResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
