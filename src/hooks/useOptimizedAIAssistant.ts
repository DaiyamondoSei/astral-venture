import { useState, useCallback, useRef, useEffect } from 'react';
import { AIQuestion, AIResponse, AIQuestionOptions, AIModelInfo } from '@/services/ai/types';
import { getAIResponse } from '@/services/ai/aiProcessingService';

export function useOptimizedAIAssistant() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modelInfo, setModelInfo] = useState<AIModelInfo>({
    model: '',
    tokenCount: 0,
    processingTime: 0,
  });

  // Track request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const submitQuestion = useCallback(async (
    questionInput: string | AIQuestion,
    options?: AIQuestionOptions
  ) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // Handle either string or AIQuestion object
    let finalQuestion: AIQuestion;
    
    if (typeof questionInput === 'string') {
      finalQuestion = { 
        text: questionInput, 
        question: questionInput, 
        userId: options?.userId || 'default-user',
        context: options?.context,
        reflectionIds: options?.reflectionIds,
      };
    } else {
      finalQuestion = questionInput;
    }
    
    if (!finalQuestion.text.trim()) {
      return;
    }
    
    try {
      // Update loading state
      setLoading(true);
      setError('');
      setStreamingResponse('');
      
      // Keep a copy of question for reference
      const currentQuestionText = finalQuestion.text;
      
      // Reset question input
      setQuestion('');
      
      // Call AI service with signal for cancellation
      const response = await getAIResponse(finalQuestion.text, {
        useCache: options?.useCache ?? true,
        showLoadingToast: false,
        showErrorToast: false,
        model: options?.model || 'gpt-4o-mini',
        streaming: options?.streaming,
        signal: abortControllerRef.current.signal,
      });
      
      // Set the response
      setResponse(response);
      setModelInfo({
        model: response.meta.model,
        tokenCount: response.meta.tokenUsage,
        processingTime: response.meta.processingTime,
      });
      
      return response;
    } catch (error: any) {
      // Don't set error state if the request was deliberately canceled
      if (error.name === 'AbortError') {
        return;
      }
      
      console.error('Error submitting question:', error);
      
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to get a response. Please try again.'
      );
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);
  
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, []);
  
  return {
    question,
    setQuestion,
    response,
    streamingResponse,
    isLoading,
    error,
    modelInfo,
    submitQuestion,
    cancelRequest,
  };
}
