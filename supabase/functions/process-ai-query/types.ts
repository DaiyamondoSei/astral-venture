
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
    cacheTtl?: number;
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
    username?: string;
  };
  reflection?: {
    content: string;
    dominantEmotion?: string;
    emotionalDepth?: number;
    chakrasActivated?: string[] | string;
  };
}
