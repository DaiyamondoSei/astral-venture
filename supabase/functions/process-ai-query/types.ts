
export interface AIQueryRequest {
  query: string;
  context?: string;
  userId?: string;
  reflectionId?: string;
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    useCache?: boolean;
    cacheKey?: string;
  }
}

export interface AIQueryResponse {
  answer: string;
  insights?: any[];
  metrics?: {
    processingTime: number;
    tokenUsage?: number;
    model?: string;
  }
}

export interface ContextData {
  userProfile?: {
    userLevel: number;
    energyPoints: number;
    [key: string]: any;
  };
  reflection?: {
    content: string;
    dominantEmotion?: string;
    emotionalDepth?: number;
    chakrasActivated?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}
