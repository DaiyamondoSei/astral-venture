
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { AIResponse, AIQuestion, AIQuestionOptions } from '@/services/ai/types';
import { toast } from 'sonner';

// Optimized AI assistant hook that leverages Edge Functions
export function useOptimizedAIAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [streamingResponse, setStreamingResponse] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{
    model: string;
    tokenCount: number;
    processingTime: number;
  } | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Cleanup function for any pending requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  /**
   * Submit a question to the AI assistant using the optimized Edge Function
   */
  const submitQuestion = useCallback(async (
    questionInput: string | AIQuestion,
    options?: AIQuestionOptions
  ) => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // Format the question properly
    const question: AIQuestion = typeof questionInput === 'string' 
      ? { 
          text: questionInput,
          question: questionInput,
          userId: options?.userId || '',
          context: options?.context,
          reflectionIds: options?.reflectionIds
        } 
      : questionInput;
    
    if (!question.text.trim()) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    setStreamingResponse(null);
    
    try {
      // Choose the appropriate Edge Function based on the options
      const functionName = options?.detailedAnalysis 
        ? 'process-ai-query' 
        : 'ai-processor-enhanced';
      
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          query: question.text,
          context: question.context || '',
          reflectionId: question.reflectionIds?.[0] || '',
          userId: question.userId,
          options: {
            model: options?.model || 'gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 1000,
            stream: options?.streaming || false,
            useCache: options?.useCache !== false,
            cacheKey: options?.cacheKey
          }
        }
      });
      
      if (error) {
        throw new Error(`AI service error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No data received from AI service');
      }
      
      // Format the response
      const aiResponse: AIResponse = {
        answer: data.result || data.response || '',
        type: 'markdown',
        suggestedPractices: data.suggestedPractices || [],
        meta: {
          model: options?.model || 'gpt-4o-mini',
          tokenUsage: data.metrics?.tokenUsage || data.metrics?.totalTokens || 0,
          processingTime: data.processingTime || data.metrics?.processingTime || 0,
          cached: data.cached || false
        }
      };
      
      setResponse(aiResponse);
      setModelInfo({
        model: aiResponse.meta.model,
        tokenCount: aiResponse.meta.tokenUsage,
        processingTime: aiResponse.meta.processingTime
      });
      
      return aiResponse;
    } catch (error) {
      console.error('Error in AI assistant:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request';
      setError(errorMessage);
      
      // Only show toast if it's not a cancellation
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        toast.error('AI Assistant Error', {
          description: errorMessage,
        });
      }
      
      return null;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);
  
  /**
   * Reset the state of the AI assistant
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResponse(null);
    setStreamingResponse(null);
    setModelInfo(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  return {
    submitQuestion,
    isLoading,
    error,
    response,
    streamingResponse,
    modelInfo,
    reset
  };
}

export default useOptimizedAIAssistant;
