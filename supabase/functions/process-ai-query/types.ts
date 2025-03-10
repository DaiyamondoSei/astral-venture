
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

export interface ChakraInsight {
  chakra: string;
  status: 'active' | 'balanced' | 'blocked' | 'overactive' | 'underactive';
  description: string;
  recommendations: string[];
}

export interface AIQuestion {
  text: string;
  context?: string;
  type?: 'general' | 'reflection' | 'chakra' | 'meditation';
  reflectionId?: string;
}

export interface AIResponse {
  response: string;
  insights: any[];
  metrics?: {
    model: string;
    tokens: number;
    processingTime: number;
  };
}

export interface ChakraInsightsOptions {
  timeFrame?: 'week' | 'month' | 'all';
  chakraFilter?: string[];
  includeRecommendations?: boolean;
}
