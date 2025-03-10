
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
 * AI request options
 */
export interface AIRequestOptions {
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  user?: string;
  responseFormat?: ResponseFormat;
}

/**
 * AI completion metrics
 */
export interface CompletionMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latency: number;
}

/**
 * AI chat message
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant" | "function";
  content: string;
  name?: string;
}

/**
 * AI completion response
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
