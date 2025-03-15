
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
 */
export interface AIResponse {
  response: string;
  insights: any[];
  type?: string;
  answer?: string;
  meta: Record<string, any>;
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
 * AI Code Assistant props type
 */
export interface UseAICodeAssistantProps {
  componentName?: string;
  enableAnalysis?: boolean;
  autoAnalyze?: boolean;
}
