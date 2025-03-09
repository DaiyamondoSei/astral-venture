
/**
 * AI Service Types
 */

export interface AIQuestion {
  question: string;
  context?: string;
  reflectionIds?: string[];
  stream?: boolean;
}

export interface AIResponse {
  answer: string;
  type: 'text' | 'error' | 'loading';
  suggestedPractices: string[];
  sources?: string[];
  meta?: {
    model: string;
    tokenUsage: number;
    processingTime: number;
  }
}

export interface AIModelConfig {
  name: string;
  maxTokens: number;
  temperature: number;
  costPerToken: number;
}

export interface AIServiceConfig {
  defaultModel: string;
  models: Record<string, AIModelConfig>;
  endpoint?: string;
}
