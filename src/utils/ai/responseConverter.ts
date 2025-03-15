
import { AIResponse as ServiceAIResponse } from '@/services/ai/types';
import { AIResponse as ComponentAIResponse } from '@/components/ai-assistant/types';

/**
 * Converts a service AIResponse to a component AIResponse
 * This bridges the gap between the two interfaces to maintain compatibility
 */
export function convertToComponentAIResponse(serviceResponse: ServiceAIResponse): ComponentAIResponse {
  return {
    ...serviceResponse,
    // Ensure answer is always a string, even when optional in service response
    answer: serviceResponse.answer || serviceResponse.response || '',
    // Include type for component compatibility
    type: serviceResponse.type || 'general',
    // Ensure other optional properties are handled
    suggestedPractices: serviceResponse.suggestedPractices || [],
    // Forward insights if present
    insights: serviceResponse.insights || []
  };
}

/**
 * Converts a component AIResponse to a service AIResponse
 * Useful when feeding data back to services
 */
export function convertToServiceAIResponse(componentResponse: ComponentAIResponse): ServiceAIResponse {
  // The service response has answer as optional, so we can just pass through
  return componentResponse;
}
