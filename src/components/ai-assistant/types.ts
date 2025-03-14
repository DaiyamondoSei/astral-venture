
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
  meta: {
    model: string;
    tokenUsage?: number; 
    tokens?: number;
    processingTime: number;
    cached?: boolean;
  };
}

export interface AIQuestion {
  text: string;
  question: string;
  userId: string;
  context?: string;
  reflectionIds?: string[];
}

export interface AIQuestionOptions {
  useCache?: boolean;
  showLoadingToast?: boolean;
  showErrorToast?: boolean;
  model?: string;
  userId?: string;
  context?: string;
  reflectionIds?: string[];
}

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
  context?: string;
  created: string;
}

export interface AssistantIntent {
  id: string;
  type: string;
  description: string;
  status: 'processing' | 'completed' | 'failed';
  created: string;
  relatedComponents?: string[];
}
