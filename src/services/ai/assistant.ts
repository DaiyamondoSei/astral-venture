
import { supabase } from '@/lib/supabaseClient';
import { AIResponse, AIQuestion } from './types';
import { getCachedResponse, cacheResponse } from './cache';
import { getFallbackResponse } from './fallback';

/**
 * Ask the AI Assistant a question
 * 
 * @param question Question data including the message text and optional context
 * @param userId The user ID for personalization
 * @returns AI response
 */
export async function askAIAssistant(
  question: AIQuestion,
  userId: string
): Promise<AIResponse> {
  try {
    // First check if there's a cached response
    const cachedResponse = await getCachedResponse(question.question, userId);
    if (cachedResponse) {
      console.log("Using cached response");
      return {
        ...cachedResponse,
        meta: {
          ...cachedResponse.meta,
          model: cachedResponse.meta?.model || 'cached'
        }
      };
    }
    
    // Check if we're in offline mode
    if (!navigator.onLine) {
      console.log("Device is offline, using fallback response");
      return getFallbackResponse(question.question);
    }
    
    // Call edge function for AI response
    const { data, error } = await supabase.functions.invoke<any>('ask-assistant', {
      body: {
        message: question.question,
        reflectionId: question.reflectionIds?.[0],
        reflectionContent: question.context,
        stream: question.stream
      }
    });
    
    if (error) {
      console.error("Error calling AI assistant:", error);
      return {
        text: "Sorry, I encountered an error processing your request.",
        answer: "Sorry, I encountered an error processing your request.",
        type: 'error'
      };
    }
    
    if (!data) {
      return {
        text: "Sorry, I received an empty response. Please try again.",
        answer: "Sorry, I received an empty response. Please try again.",
        type: 'error'
      };
    }
    
    const response: AIResponse = {
      text: data.answer,
      answer: data.answer,
      suggestedPractices: data.suggestedPractices || [],
      relatedInsights: data.relatedInsights || [],
      meta: {
        model: data.meta?.model || 'unknown',
        tokenUsage: data.meta?.tokenUsage || 0,
        processingTime: data.meta?.processingTime || 0,
        streaming: question.stream || false
      }
    };
    
    // Cache the response for future use
    await cacheResponse(question.question, userId, response);
    
    return response;
  } catch (error) {
    console.error("Exception in askAIAssistant:", error);
    
    // Return a graceful error message
    return {
      text: "Sorry, something went wrong while processing your request.",
      answer: "Sorry, something went wrong while processing your request.",
      type: 'error'
    };
  }
}
