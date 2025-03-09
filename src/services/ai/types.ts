
/**
 * AIQuestion interface for structured AI requests
 */
export interface AIQuestion {
  text: string;
  question?: string;
  context?: string;
  reflectionIds?: string[];
  userId?: string;
  stream?: boolean;
}

/**
 * AIQuestionOptions interface for configuring AI requests
 */
export interface AIQuestionOptions {
  cacheResults?: boolean;
  stream?: boolean;
  priority?: 'low' | 'medium' | 'high';
  maxTokens?: number;
  cacheKey?: string;
}

/**
 * AIResponse interface for structured AI responses
 */
export interface AIResponse {
  answer: string;
  insights?: string[];
  suggestedPractices?: string[];
  relatedInsights?: string[];
  reflectionId?: string;
  type?: 'text' | 'error' | 'stream';
  meta?: {
    processingTime?: number;
    tokenUsage?: number;
    model?: string;
  };
  sources?: any[];
}

/**
 * AIInsight interface for structured insights
 */
export interface AIInsight {
  id: string;
  type: 'chakra' | 'emotion' | 'practice' | 'wisdom';
  text: string;
  confidence: number;
  relevance: number;
  title: string;
}

/**
 * AssistantSuggestion interface for code-related suggestions
 */
export interface AssistantSuggestion {
  id: string;
  type: 'performance' | 'quality' | 'security' | 'accessibility';
  component: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  autoFixAvailable: boolean;
  created: string;
  status: 'pending' | 'applied' | 'dismissed';
}

/**
 * AssistantIntent interface for code assistant intents
 */
export interface AssistantIntent {
  id: string;
  type: 'fix' | 'optimize' | 'refactor';
  description: string;
  componentId: string;
  status: 'pending' | 'completed' | 'failed';
  created: string;
}

/**
 * Types for AI Code Assistant
 */
export interface UseAICodeAssistantProps {
  component: string;
  options?: {
    autoAnalyze?: boolean;
    analysisDepth?: 'simple' | 'detailed';
  };
}

/**
 * ChakraInsightsOptions interface for chakra-specific insights
 */
export interface ChakraInsightsOptions {
  includeRecommendations?: boolean;
  detailLevel?: 'basic' | 'detailed';
  timeframe?: 'recent' | 'all';
}
