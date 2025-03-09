
// Define supported AI models
export type AIModel = "gpt-4o" | "gpt-4o-mini" | "gpt-3.5-turbo";

// Types for content moderation
export type ContentModerationType = 
  | "sexual" 
  | "hate" 
  | "harassment" 
  | "self-harm" 
  | "violence" 
  | "graphic";

// Chat completion metrics
export interface ChatMetrics {
  model: string;
  totalTokens: number;
  promptTokens?: number;
  completionTokens?: number;
}

// Chat completion options
export interface ChatOptions {
  model?: AIModel;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  top_p?: number;
}
