
/**
 * AI Service Types
 * 
 * This module defines types used by the AI services and assistants.
 */

/**
 * AI Question structure
 */
export interface AIQuestion {
  text: string;
  question: string;
  userId: string;
  context?: string;
  reflectionIds?: string[];
  metadata?: Record<string, unknown>;
  stream?: boolean;
}

/**
 * AI Response structure
 * Unified interface used across both services and components
 */
export interface AIResponse {
  // Required fields
  response: string;
  insights: any[];
  meta: Record<string, any>;
  
  // Optional fields
  type?: string;
  answer: string; // Making this required for consistency with component expectations
  suggestedPractices?: any[];
}

/**
 * AI Insight structure
 */
export interface AIInsight {
  id: string;
  category: string;
  type: string;
  content: string;
  text?: string;
  title?: string;
  confidence?: number;
  relevance?: number;
  created: Date;
}

/**
 * Assistant suggestion type
 */
export interface AssistantSuggestion {
  id: string;
  title: string;
  description: string;
  component: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  status?: 'pending' | 'implemented' | 'dismissed';
  autoFixAvailable: boolean;
  codeExample?: string;
  context?: Record<string, any>;
  created?: string;
}

/**
 * Assistant intent type
 */
export interface AssistantIntent {
  id: string;
  type: string;
  created: Date;
  status: AssistantIntentStatus;
  updated?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Assistant intent status type
 */
export type AssistantIntentStatus = 'pending' | 'completed' | 'failed';

/**
 * AI Question options
 */
export interface AIQuestionOptions {
  model?: string;
  useCache?: boolean;
  showLoadingToast?: boolean;
  showErrorToast?: boolean;
  stream?: boolean;
  [key: string]: any;
}

/**
 * AI Response metadata structure
 */
export interface AIResponseMeta {
  model: string;
  tokenUsage: number;
  processingTime: number;
  cached?: boolean;
  [key: string]: any;
}

/**
 * AI Model information structure
 */
export interface AIModelInfo {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  contextWindow: number;
  costPer1KTokens: number;
  isDefault?: boolean;
}

/**
 * AI Code Assistant props type
 */
export interface UseAICodeAssistantProps {
  componentName?: string;
  enableAnalysis?: boolean;
  autoAnalyze?: boolean;
}

/**
 * Emotional analysis result type
 */
export interface EmotionalAnalysisResult {
  dominantEmotion: string;
  emotionScores: Record<string, number>;
  sentimentScore: number;
  insights: string[];
  keywords: string[];
  summary: string;
}
