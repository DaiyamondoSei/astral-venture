
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
