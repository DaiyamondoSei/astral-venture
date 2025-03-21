
/**
 * AI Assistant Service
 * Provides AI-powered assistance and insights
 * Optimized for performance and error handling
 */

import { AIResponse, AIQuestion, AIQuestionOptions } from './types';
import { createFallbackResponse } from './fallback';
import { api } from '@/utils/apiClient';

const EDGE_FUNCTION_URL = '/api/ask-assistant';

// Cache for AI responses to minimize redundant requests
const responseCache = new Map<string, {
  response: AIResponse;
  timestamp: number;
  expiresAt: number;
  isStreamingResponse: boolean;
}>();

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Generate a cache key from a question
 */
function generateCacheKey(question: AIQuestion): string {
  return JSON.stringify({
    text: question.text || question.question,
    reflectionIds: question.reflectionIds,
    context: question.context
  });
}

/**
 * Fetch a response from the AI assistant with caching and performance optimizations
 */
async function fetchAssistantResponse(question: AIQuestion, options?: AIQuestionOptions): Promise<AIResponse> {
  try {
    // Check if online before attempting fetch
    if (!navigator.onLine) {
      console.warn('Offline: Using fallback AI response');
      return createFallbackResponse(question.question || question.text || '');
    }
    
    // Determine if this is a streaming request
    const isStreamingRequest = question.stream === true;
    
    // Check cache for matching question to avoid redundant API calls
    const cacheKey = generateCacheKey(question);
    const cached = responseCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && 
        (now < cached.expiresAt) && 
        (cached.isStreamingResponse === isStreamingRequest)) {
      console.log('Using cached AI response');
      return cached.response;
    }
    
    // Log request information for debugging
    console.log("Fetching AI assistant response:", {
      questionText: question.text || question.question,
      hasReflectionIds: question.reflectionIds && question.reflectionIds.length > 0,
      hasContext: !!question.context,
      streamEnabled: question.stream,
      cacheKey: options?.cacheKey || cacheKey
    });
    
    // Performance measurement
    const startTime = performance.now();
    
    // Use the API client to fetch response from edge function
    let response: AIResponse;
    
    if (api.askAIAssistant) {
      // Use API client if available
      response = await api.askAIAssistant(question, {
        ...options,
        cacheKey: options?.cacheKey || cacheKey
      });
    } else {
      // Use fetch as fallback (shouldn't normally be needed)
      const fetchResponse = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...question,
          options
        }),
      });
      
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        console.error('AI Assistant error:', errorText);
        throw new Error(`AI request failed: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }
      
      const data = await fetchResponse.json();
      
      // Format the response to match AIResponse interface
      response = {
        answer: data.answer || data.text || '',
        suggestedPractices: data.suggestedPractices || [],
        sources: data.sources || [],
        type: isStreamingRequest ? 'stream' : 'text',
        meta: {
          model: data.meta?.model || "unknown",
          tokenUsage: data.meta?.tokenUsage || 0,
          processingTime: data.meta?.processingTime || (performance.now() - startTime),
        }
      };
    }
    
    const requestTime = performance.now() - startTime;
    console.log(`AI request time: ${requestTime.toFixed(2)}ms`);
    
    // Cache the response
    responseCache.set(cacheKey, {
      response,
      timestamp: now,
      expiresAt: now + CACHE_TTL,
      isStreamingResponse: isStreamingRequest
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    
    // Return a graceful fallback response
    return createFallbackResponse(question.question || question.text || '');
  }
}

/**
 * Process the user's question and return an AI response
 * This is the main entry point for the AI assistant
 * Optimized with input validation and error handling
 */
export async function processQuestion(
  question: string, 
  context?: string,
  options?: AIQuestionOptions
): Promise<AIResponse> {
  try {
    // Validate input
    if (!question || typeof question !== 'string' || question.trim() === '') {
      console.error('Invalid question input:', question);
      return {
        answer: "Please provide a valid question.",
        type: 'error',
        suggestedPractices: []
      };
    }
    
    const aiQuestion: AIQuestion = {
      text: question,
      question,
      context,
      stream: false
    };
    
    return await fetchAssistantResponse(aiQuestion, options);
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
 * Optimized for better type handling and error recovery
 */
export const askAIAssistant = async (
  question: AIQuestion | string,
  options?: AIQuestionOptions
): Promise<AIResponse> => {
  try {
    // Handle case where question is a string
    if (typeof question === 'string') {
      return await fetchAssistantResponse({
        text: question,
        question
      }, options);
    }
    
    // Make sure text field is always present for backward compatibility
    const enhancedQuestion: AIQuestion = {
      ...question,
      text: question.text || question.question || '',
      question: question.question || question.text || ''
    };
    
    return await fetchAssistantResponse(enhancedQuestion, options);
  } catch (error) {
    console.error('Error in askAIAssistant:', error);
    return createFallbackResponse(
      typeof question === 'string' ? question : (question.question || question.text || '')
    );
  }
};

// Clear cache periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  let clearedEntries = 0;
  
  responseCache.forEach((value, key) => {
    if (now > value.expiresAt) {
      responseCache.delete(key);
      clearedEntries++;
    }
  });
  
  if (clearedEntries > 0) {
    console.log(`Cleared ${clearedEntries} expired AI response cache entries`);
  }
}, 10 * 60 * 1000); // Run every 10 minutes
