
/**
 * AI Service Types
 */

export interface AIResponse {
  text?: string;          // Original property
  answer?: string;        // New property used by components
  sources?: string[];
  type?: 'text' | 'error' | 'loading';
  suggestedPractices?: string[];
  relatedInsights?: any[];
  meta?: {
    model: string;
    tokenUsage: number;
    processingTime: number;
    streaming?: boolean;
  };
}

export interface AIQuestion {
  question: string;
  reflectionIds?: string[];
  context?: string;
  stream?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  contextSize: number;
  costPer1KTokens: number;
}

export interface AIModelInfo {
  model: string;
  tokens: number;
}

export interface AIInsight {
  type: string;
  content: string;
  confidence: number;
  relatedConcepts?: string[];
}

export interface AIAssistantRequest {
  question: string;
  context?: string;
  userId?: string;
  sessionId?: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface AIAssistantResponse {
  response: AIResponse;
  modelInfo?: AIModelInfo;
  insights?: AIInsight[];
}
