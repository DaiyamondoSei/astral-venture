
import { AIResponse, AIQueryParams, AIServiceConfig, AIModel, AIInsight } from './types';
import { createFallbackResponse } from '@/services/ai/fallback';

// Default configuration
const defaultConfig: AIServiceConfig = {
  defaultModel: AIModel.DEFAULT,
  fallbackToLocalModels: true,
  streamingEnabled: false,
  personalizedResponses: true,
  maxHistoryItems: 10
};

/**
 * Core AI service for handling natural language requests
 */
export async function getAIResponse(
  message: string,
  options?: Partial<AIQueryParams>
): Promise<AIResponse> {
  try {
    // Attempt to call the Supabase edge function
    const { data } = await fetch('/api/ask-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId: options?.userId,
        context: options?.context,
      }),
    }).then(res => res.json());
    
    return {
      answer: data.response,
      type: 'text',
      suggestedPractices: data.suggestedPractices || [],
      meta: {
        model: data.model || AIModel.DEFAULT,
        tokenUsage: data.tokenUsage || 0,
        processingTime: data.processingTime || 0
      }
    };
  } catch (error) {
    console.error('Error getting AI response:', error);
    
    // Use fallback response in case of error
    return createFallbackResponse(message);
  }
}

/**
 * Generate insights based on user activities
 */
export async function generateInsights(
  userId: string,
  data: any[]
): Promise<AIInsight[]> {
  try {
    const response = await fetch('/api/generate-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        data
      }),
    });
    
    const result = await response.json();
    return result.insights || [];
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

/**
 * Get configuration for the AI service
 */
export function getAIServiceConfig(): AIServiceConfig {
  return {
    ...defaultConfig
  };
}
