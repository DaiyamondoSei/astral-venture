
// AI Question type for sending requests
export interface AIQuestion {
  question: string;
  reflectionIds?: string[];
  context?: string;
  stream?: boolean;
}

// AI Response type for receiving responses
export interface AIResponse {
  answer: string;
  relatedInsights?: any[];
  suggestedPractices?: string[];
  meta?: {
    model: string;
    tokenUsage: number;
    processingTime?: number;
    streaming?: boolean;
  };
}

// AI Insight type for reflection analysis
export interface AIInsight {
  id?: string;
  content: string;
  category: string;
  confidence?: number;
  relevance?: number;
  created_at?: string;
  reflection_id?: string;
}

// Supported AI models
export type AIModel = 
  | "gpt-4o"         // High quality, higher cost, slower
  | "gpt-4o-mini";   // Good quality, lower cost, faster
