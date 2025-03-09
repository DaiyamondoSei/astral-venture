
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
async function fetchAssistantResponse(question: AIQuestion): Promise<AIResponse> {
  try {
    // Check if online before attempting fetch
    if (!navigator.onLine) {
      console.warn('Offline: Using fallback AI response');
      return createFallbackResponse(question.question || question.text || '');
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
    return createFallbackResponse(question.question || question.text || '');
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
      text: question,
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

/**
 * Ask the AI assistant a question
 * This function is a compatibility layer for the old askAIAssistant function
 */
export const askAIAssistant = async (
  question: AIQuestion | string,
  userId?: string
): Promise<AIResponse> => {
  try {
    // Log user context for debugging
    if (userId) {
      console.log(`Processing question for user ${userId}`);
    }
    
    // Handle case where question is a string
    if (typeof question === 'string') {
      return await fetchAssistantResponse({
        text: question,
        question,
        userId
      });
    }
    
    // Make sure text field is always present for backward compatibility
    const enhancedQuestion: AIQuestion = {
      ...question,
      text: question.text || question.question,
      question: question.question || question.text
    };
    
    return await fetchAssistantResponse(enhancedQuestion);
  } catch (error) {
    console.error('Error in askAIAssistant:', error);
    return createFallbackResponse(
      typeof question === 'string' ? question : (question.question || question.text || '')
    );
  }
};
