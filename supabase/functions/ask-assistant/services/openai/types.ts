
// Define supported AI models
export type AIModel = "gpt-4o" | "gpt-4o-mini";

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
}
