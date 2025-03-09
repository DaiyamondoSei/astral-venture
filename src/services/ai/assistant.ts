
/**
 * AI Assistant Service
 * Provides AI-powered assistance and insights
 */

import { AIResponse, AIQuestion } from './types';
import { createFallbackResponse } from './fallback';

const EDGE_FUNCTION_URL = '/api/ask-assistant';

/**
 * Fetch a response from the AI assistant
 */
export async function fetchAssistantResponse(question: AIQuestion): Promise<AIResponse> {
  try {
    // Check if online before attempting fetch
    if (!navigator.onLine) {
      console.warn('Offline: Using fallback AI response');
      return createFallbackResponse(question.question);
    }
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Assistant error:', errorText);
      throw new Error(`AI request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format the response to match AIResponse interface
    const formattedResponse: AIResponse = {
      answer: data.answer || data.text || '',
      suggestedPractices: data.suggestedPractices || [],
      sources: data.sources || [],
      type: 'text',
      meta: {
        model: data.meta?.model || 'unknown',
        tokenUsage: data.meta?.tokenUsage || 0,
        processingTime: data.meta?.processingTime || 0,
      }
    };
    
    return formattedResponse;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    
    // Return a graceful fallback response
    return createFallbackResponse(question.question);
  }
}

/**
 * Process the user's question and return an AI response
 * This is the main entry point for the AI assistant
 */
export async function processQuestion(
  question: string, 
  context?: string
): Promise<AIResponse> {
  try {
    const aiQuestion: AIQuestion = {
      question,
      context,
      stream: false
    };
    
    return await fetchAssistantResponse(aiQuestion);
  } catch (error) {
    console.error('Error processing question:', error);
    return {
      answer: "I'm having trouble processing your question right now. Please try again later.",
      type: 'error',
      suggestedPractices: []
    };
  }
}
