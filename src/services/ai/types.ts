
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

export interface AssistantSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'optimization' | 'improvement' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'critical';
  component?: string;
  created: Date;
  status: 'pending' | 'applied' | 'dismissed';
}

export interface AssistantIntent {
  id: string;
  type: string;
  description: string;
  confidence: number;
  created: Date;
}

export interface UseAICodeAssistantProps {
  component?: string;
  file?: string;
  autoAnalyze?: boolean;
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
  runAnalysis: (component?: string) => Promise<void>;
  dismissSuggestion: (suggestionId: string) => void;
  applyFix: (suggestionId: string) => Promise<boolean>;
}

export interface ChakraInsightsOptions {
  includeChakraDetails?: boolean;
  includeEmotionalAnalysis?: boolean;
  includeRecommendations?: boolean;
}
