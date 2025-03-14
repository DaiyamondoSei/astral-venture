
import { useState } from 'react';
import { getAIResponse } from '@/services/ai/aiProcessingService';
import { useAssistantState } from './useAssistantState';
import { AIQuestion, AIQuestionOptions, AIResponse } from '../types';

// Hook for submitting questions to the AI assistant
export const useQuestionSubmit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setResponse, setStreamingResponse, setModelInfo } = useAssistantState();
  const [tokenMetrics, setTokenMetrics] = useState<{ model: string; tokens: number }>({
    model: '',
    tokens: 0
  });

  // Submit a question to the AI assistant
  const submitQuestion = async (
    questionInput: string | AIQuestion,
    options?: AIQuestionOptions
  ) => {
    // Form the question object
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
      // If it's already an AIQuestion object, use it directly
      finalQuestion = questionInput;
    }
    
    setIsLoading(true);
    setError('');
    setStreamingResponse('');
    
    try {
      // Call the AI service
      const response = await getAIResponse(finalQuestion.text, {
        useCache: options?.useCache ?? true,
        showLoadingToast: options?.showLoadingToast ?? false,
        showErrorToast: options?.showErrorToast ?? false,
        model: options?.model || 'gpt-4o-mini'
      });
      
      // Update state with response
      setResponse(response);
      setIsLoading(false);
      
      // Update token metrics, handling both tokenUsage and tokens properties
      if (response.meta?.tokenUsage) {
        setTokenMetrics({
          model: response.meta.model,
          tokens: response.meta.tokenUsage
        });
        setModelInfo({
          model: response.meta.model,
          tokens: response.meta.tokenUsage
        });
      } else if (response.meta?.tokens) {
        setTokenMetrics({
          model: response.meta.model,
          tokens: response.meta.tokens
        });
        setModelInfo({
          model: response.meta.model,
          tokens: response.meta.tokens
        });
      }
      
      return response;
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error.message || 'Failed to communicate with AI assistant';
      setError(errorMessage);
      console.error('Error in AI request:', error);
      return null;
    }
  };
  
  return {
    submitQuestion,
    isLoading,
    error,
    tokenMetrics
  };
};
