
/**
 * Supported OpenAI models
 */
export type AIModel = 
  | "gpt-3.5-turbo"
  | "gpt-4o-mini"
  | "gpt-4o";

/**
 * Content moderation categories from OpenAI
 */
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

/**
 * Response format configuration
 */
export type ResponseFormat = 
  | { type: "text" }
  | { type: "json_object" };

/**
 * AI request options with better types
 */
export interface AIRequestOptions {
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  user?: string;
  responseFormat?: ResponseFormat;
  functions?: Array<ChatFunction>;
  functionCall?: string | { name: string };
}

/**
 * Chat function for function calling
 */
export interface ChatFunction {
  name: string;
  description?: string;
  parameters: {
    type: "object";
    properties: Record<string, FunctionParameter>;
    required?: string[];
  };
}

/**
 * Function parameter definition
 */
export type FunctionParameter = {
  type: "string" | "number" | "integer" | "boolean" | "array" | "object";
  description?: string;
  enum?: string[];
  items?: {
    type: string;
    enum?: string[];
  };
  properties?: Record<string, FunctionParameter>;
  required?: string[];
};

/**
 * AI completion metrics for tracking
 */
export interface ChatMetrics {
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens: number;
  latency?: number;
}

/**
 * AI chat message
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant" | "function";
  content: string | null;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

/**
 * AI chat options
 */
export interface ChatOptions {
  model?: AIModel;
  temperature?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  user?: string;
  functions?: Array<ChatFunction>;
  function_call?: string | { name: string };
}

/**
 * AI completion response structure from OpenAI
 */
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: "stop" | "length" | "content_filter" | "function_call";
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Streaming response chunk from OpenAI
 */
export interface StreamingResponseChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: Partial<ChatMessage>;
    finish_reason: null | "stop" | "length" | "content_filter" | "function_call";
  }[];
}
