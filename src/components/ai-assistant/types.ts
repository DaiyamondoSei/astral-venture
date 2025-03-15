
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
  reflectionIds?: string[]; // Added to support reflection context
}

/**
 * Options for AI question submission
 */
export interface AIQuestionOptions {
  reflectionId?: string;
  reflectionContent?: string;
  reflectionIds?: string[]; // Added to match implementation
  stream?: boolean;
  cacheKey?: string;
  userId?: string; // Added to match implementation
  context?: string; // Added to match implementation
  useCache?: boolean; // Added to match implementation
  showLoadingToast?: boolean; // Added to match implementation
  showErrorToast?: boolean; // Added to match implementation
  model?: string; // Added to match implementation
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
  category?: string; // Added to match implementation
  estimatedDuration?: string; // Added to match implementation
  tags?: string[]; // Added to match implementation
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
  initialPrompt?: string; // Added to match implementation
  description?: string; // Added to match implementation
  maxHeight?: string; // Added to match implementation
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
