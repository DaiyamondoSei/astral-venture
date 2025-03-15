
import { AIResponse as ServiceAIResponse, AIInsight, AssistantSuggestion } from '@/services/ai/types';

/**
 * AI Response with required answer field for backward compatibility
 */
export interface AIResponse extends ServiceAIResponse {
  answer: string;
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
