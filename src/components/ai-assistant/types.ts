
import { AIResponse as ServiceAIResponse, AIInsight, AssistantSuggestion } from '@/services/ai/types';

/**
 * Question sent to the AI assistant
 */
export interface AIQuestion {
  text: string;
  question: string;
  userId: string;
  context?: string;
  stream?: boolean;
}

/**
 * Options for AI question submission
 */
export interface AIQuestionOptions {
  reflectionId?: string;
  reflectionContent?: string;
  stream?: boolean;
  cacheKey?: string;
}

/**
 * Content recommendation from AI
 */
export interface ContentRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'practice' | 'reflection' | 'meditation';
  relevance: number;
  url?: string;
}

/**
 * Props for AI Response Display component
 */
export interface AIResponseDisplayProps {
  response: AIResponse | null;
  isLoading?: boolean;
  className?: string;
}

/**
 * Props for AI Dashboard Widget component
 */
export interface AIDashboardWidgetProps {
  title?: string;
  className?: string;
  showInsights?: boolean;
}

/**
 * AI Response with required answer field for backward compatibility
 */
export interface AIResponse extends ServiceAIResponse {
  answer: string;
  type?: string;
  suggestedPractices?: string[];
  sources?: string[];
}

/**
 * Convert service AI response to component-compatible format
 */
export function convertToComponentAIResponse(serviceResponse: ServiceAIResponse): AIResponse {
  return {
    ...serviceResponse,
    answer: serviceResponse.answer || serviceResponse.response || ''
  };
}

export type { AIInsight, AssistantSuggestion };
