
/**
 * AI service types
 * Improved type definitions for better type safety
 */

export type AIModel = 'gpt-4o-mini' | 'gpt-4o' | 'gpt-3.5-turbo' | string;

export interface AIQuestionOptions {
  temperature?: number;
  maxTokens?: number;
  model?: AIModel;
  cacheKey?: string; // Added to support backend caching
}

export interface AIQuestion {
  text: string;
  question?: string;
  context?: string;
  reflectionIds?: string[];
  stream?: boolean;
  userId?: string; // Added to support user-specific contexts
}

export interface AIResponseMeta {
  model?: string;
  tokenUsage?: number;
  processingTime?: number;
  source?: string;
}

export interface AIResponse {
  answer: string;
  type: 'text' | 'error' | 'stream';
  suggestedPractices: string[];
  sources?: {url: string; title: string}[];
  meta?: AIResponseMeta;
}

// AI Insights related types
export interface AIInsight {
  id: string;
  text: string;
  type: 'chakra' | 'emotion' | 'practice' | 'wisdom' | 'general';
  confidence: number;
  relevance: number;
  source?: string;
}

export interface AssistantSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'optimization' | 'improvement' | 'warning' | 'error' | 'performance' | 'quality';
  priority: 'low' | 'medium' | 'high' | 'critical';
  component?: string;
  created: Date;
  status: 'pending' | 'applied' | 'dismissed';
  autoFixAvailable?: boolean;
  codeExample?: string;
  context?: string;
}

export interface AssistantIntent {
  id: string;
  type: string;
  description: string;
  confidence: number;
  created: Date;
  status?: 'active' | 'completed' | 'dismissed';
  relatedComponents?: string[];
}

export interface UseAICodeAssistantProps {
  component?: string;
  file?: string;
  autoAnalyze?: boolean;
  initialComponents?: string[];
  analysisDepth?: 'shallow' | 'medium' | 'deep';
}

export interface AICodeAssistantOptions {
  autoFix?: boolean;
  includePerformance?: boolean;
  includePatterns?: boolean;
  includeSecurity?: boolean;
}

export interface AICodeAssistantContext {
  suggestions: AssistantSuggestion[];
  intents: AssistantIntent[];
  isAnalyzing: boolean;
  currentComponent: string;
  error: string;
  isFixing: boolean;
  loading?: boolean;
  applyAutoFix?: (suggestionId: string) => Promise<boolean>;
  lastUpdated?: Date;
  runAnalysis: (component?: string) => Promise<void>;
  dismissSuggestion: (suggestionId: string) => void;
  applyFix: (suggestionId: string) => Promise<boolean>;
}

export interface ChakraInsightsOptions {
  includeChakraDetails?: boolean;
  includeEmotionalAnalysis?: boolean;
  includeRecommendations?: boolean;
}
