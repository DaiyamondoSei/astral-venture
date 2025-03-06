
import { supabase } from '@/integrations/supabase/client';
import { AIQuestion, AIResponse } from './types';
import { getCachedResponse, cacheResponse } from './cache';
import { createFallbackResponse } from './fallback';
import { selectOptimalModel } from './models';

/**
 * Ask the AI assistant a question about experiences or practices
 * 
 * @param questionData - Question and optional context
 * @param userId - User ID for personalization
 * @returns AI response with answer and related content
 */
export async function askAIAssistant(
  questionData: AIQuestion,
  userId: string
): Promise<AIResponse> {
  try {
    // If streaming is requested, handle differently
    if (questionData.stream) {
      return handleStreamingRequest(questionData, userId);
    }
    
    // For non-streaming requests, check for cached response first
    const cachedResponse = getCachedResponse(questionData.question);
    if (cachedResponse && !questionData.stream) {
      console.log("Using cached response for question");
      return {
        answer: cachedResponse.answer,
        relatedInsights: [],
        suggestedPractices: cachedResponse.suggestedPractices,
        meta: {
          model: "cached",
          tokenUsage: 0,
          processingTime: 0
        }
      };
    }
    
    // Prepare request data
    const requestData: any = { 
      message: questionData.question,
      context: questionData.context,
      reflectionIds: questionData.reflectionIds,
      stream: false,
      userId 
    };
    
    console.log("Sending request to AI assistant:", requestData);
    
    // Determine optimal model
    const model = selectOptimalModel(questionData.question);
    requestData.model = model;
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ask-assistant', {
      body: requestData
    });
    
    if (error) {
      console.error("Error from ask-assistant function:", error);
      // Handle quota errors specifically
      if (error.message && error.message.includes("quota")) {
        throw new Error("AI service quota exceeded. Please try again later.");
      }
      throw error;
    }
    
    console.log("Received response from AI assistant:", data);
    
    // Extract metadata if available
    const meta = {
      model: data.meta?.model || "unknown",
      tokenUsage: data.meta?.tokenUsage || 0,
      processingTime: data.meta?.processingTime || 0
    };
    
    // Structure the response
    const response = {
      answer: data.response || data.answer,
      relatedInsights: data.insights || [],
      suggestedPractices: data.suggestedPractices || [],
      meta
    };
    
    // Cache the response for future use (only for non-streaming)
    cacheResponse(questionData.question, response);
    
    return response;
  } catch (error) {
    console.error('Error asking AI assistant:', error);
    
    // Use fallback response in case of error
    return createFallbackResponse(questionData.question);
  }
}

/**
 * Handle streaming response from AI assistant
 */
async function handleStreamingRequest(
  questionData: AIQuestion,
  userId: string
): Promise<AIResponse> {
  try {
    // Prepare request data for streaming
    const requestData: any = { 
      message: questionData.question,
      context: questionData.context,
      reflectionIds: questionData.reflectionIds,
      stream: true,
      userId 
    };
    
    // Always use the more reliable model for streaming
    requestData.model = 'gpt-4o';
    
    console.log("Sending streaming request to AI assistant:", requestData);
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ask-assistant', {
      body: requestData
    });
    
    if (error) {
      console.error("Error from streaming ask-assistant function:", error);
      throw error;
    }
    
    // For streaming, we just return a minimal response to acknowledge the request was accepted
    // The actual content will be delivered via the streaming callback
    return {
      answer: data.initialResponse || "Processing your question...",
      relatedInsights: [],
      suggestedPractices: [],
      meta: {
        model: requestData.model,
        tokenUsage: 0,
        processingTime: 0,
        streaming: true // This is now permitted by the updated interface
      }
    };
  } catch (error) {
    console.error('Error in streaming request:', error);
    
    // Use fallback response in case of error, even for streaming requests
    return createFallbackResponse(questionData.question);
  }
}
