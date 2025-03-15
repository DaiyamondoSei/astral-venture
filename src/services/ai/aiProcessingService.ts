
import { AIQuestion, AIQuestionOptions, AIResponse, AIResponseMeta } from './types';
import { supabase } from '@/lib/supabaseUnified';

/**
 * Get AI response from the server
 * This function serves as a facade to the actual AI processing logic
 * which is handled by Edge Functions
 */
export async function getAIResponse(
  question: string, 
  options: AIQuestionOptions = {}
): Promise<AIResponse> {
  try {
    // Add default options
    const finalOptions = {
      useCache: true,
      showLoadingToast: true,
      showErrorToast: true,
      model: 'gpt-4o-mini',
      ...options
    };

    // Call the Edge Function for AI processing
    const { data, error } = await supabase.functions.invoke('ai-processor-enhanced', {
      body: {
        question,
        options: finalOptions
      }
    });

    if (error) {
      console.error('AI processing error:', error);
      throw new Error(error.message || 'Failed to process AI request');
    }

    if (!data) {
      throw new Error('No response received from AI service');
    }

    // Transform the response to the expected format with all required fields
    const response: AIResponse = {
      response: data.result || '',
      answer: data.result || '',  // Ensure answer is always present
      type: data.type || 'text',
      insights: data.insights || [],
      suggestedPractices: data.suggestedPractices || [],
      meta: {
        model: data.model || finalOptions.model,
        tokenUsage: data.tokenUsage || 0,
        processingTime: data.processingTime || 0,
        cached: data.cached || false
      }
    };

    return response;
  } catch (error) {
    console.error('Error in getAIResponse:', error);
    
    // Return a formatted error response with all required fields
    return {
      response: error instanceof Error ? error.message : 'An unknown error occurred',
      answer: error instanceof Error ? error.message : 'An unknown error occurred',
      type: 'error',
      insights: [],
      suggestedPractices: [],
      meta: {
        model: options.model || 'unknown',
        tokenUsage: 0,
        processingTime: 0
      }
    };
  }
}

/**
 * Analyze emotional content of text
 */
export async function analyzeEmotionalContent(text: string, options: AIQuestionOptions = {}) {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-emotions', {
      body: {
        text,
        options: {
          detailedAnalysis: true,
          ...options
        }
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error analyzing emotional content:', error);
    throw error;
  }
}

/**
 * Analyze reflection content for insights
 */
export async function analyzeReflection(text: string, options: AIQuestionOptions = {}) {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-reflection', {
      body: {
        text,
        options: {
          includeEmotionalAnalysis: true,
          ...options
        }
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error analyzing reflection:', error);
    throw error;
  }
}
