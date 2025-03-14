
import { ReactNode } from 'react';

export interface AIDashboardWidgetProps {
  initialPrompt?: string;
  title?: string;
  description?: string;
  maxHeight?: string;
}

export interface AIGuidedPracticeProps {
  title?: string;
  description?: string;
  initialPrompt?: string;
  maxHeight?: string;
}

export interface AIResponseDisplayProps {
  response: AIResponse;
}

export interface AIResponse {
  answer: string;
  type: 'text' | 'code' | 'markdown' | 'error';
  suggestedPractices?: string[];
  meta: AIResponseMeta;
}

export interface AIResponseMeta {
  model: string;
  tokenUsage?: number; 
  tokens?: number; // Support both property names for backward compatibility
  processingTime: number;
  cached?: boolean;
}

export interface AIQuestion {
  text: string;
  question: string;
  userId: string;
  context?: string;
  reflectionIds?: string[];
  stream?: boolean; // Add streaming support
}

export interface AIQuestionOptions {
  useCache?: boolean;
  showLoadingToast?: boolean;
  showErrorToast?: boolean;
  model?: string;
  userId?: string;
  context?: string;
  reflectionIds?: string[];
  signal?: AbortSignal; // Support for cancellation
}

// Define runtime constants for types that need to be used as values
export const AI_MODELS = {
  GPT_4: 'gpt-4',
  GPT_4_TURBO: 'gpt-4-turbo',
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  GPT_4O_MINI: 'gpt-4o-mini'
} as const;

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];

// Assistant Suggestion System types
export interface AssistantSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'optimization' | 'bugfix' | 'enhancement' | 'refactoring';
  status: 'pending' | 'implemented' | 'dismissed';
  component?: string;
  code?: string;
  codeExample?: string;
  autoFixAvailable?: boolean;
  context: {
    component?: string;
    file?: string;
    lineNumber?: number;
    severity?: string;
  };
}

export interface AssistantIntent {
  id: string;
  type: string;
  description: string;
  status: 'processing' | 'completed' | 'failed' | 'implemented';
  created: Date;
  updated?: Date;
  relatedComponents: string[];
}

export type AssistantIntentStatus = 'processing' | 'completed' | 'failed' | 'implemented';
