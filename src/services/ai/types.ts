
/**
 * AI Service Types
 */

export interface AIResponse {
  text: string;
  sources?: string[];
  type?: 'text' | 'error' | 'loading';
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
