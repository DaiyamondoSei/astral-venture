
import { useCallback, MutableRefObject } from 'react';
import { useAssistantState } from './useAssistantState';
import { AIQuestion, AIQuestionOptions } from '@/services/ai/types';
import { getAIResponse } from '@/services/ai/aiProcessingService';

interface UseQuestionSubmitProps {
  state: ReturnType<typeof useAssistantState>;
  reflectionContext?: string;
  selectedReflectionId?: string;
  userId: string;
  isMounted: MutableRefObject<boolean>;
}

export const useQuestionSubmit = ({
  state,
  reflectionContext,
  selectedReflectionId,
  userId,
  isMounted
}: UseQuestionSubmitProps) => {
  
  const submitQuestion = useCallback(async (
    questionInput: string | AIQuestion,
    options?: AIQuestionOptions
  ) => {
    // Handle either string or AIQuestion object
    let question: AIQuestion;
    
    if (typeof questionInput === 'string') {
      question = { 
        text: questionInput, 
        question: questionInput, 
        userId 
      };
    } else {
      question = questionInput;
    }
    
    if (!question.text.trim()) {
      return;
    }
    
    try {
      // Update loading state
      state.setLoading(true);
      state.setError('');
      
      // Keep a copy of question for history
      const currentQuestion = question.text;
      
      // Reset after submit
      state.setQuestion('');
      
      // Call AI service
      const response = await getAIResponse(question.text, {
        useCache: options?.useCache ?? true,
        showLoadingToast: false, // We'll handle loading UI ourselves
        showErrorToast: false,   // We'll handle errors ourselves
        model: options?.model || 'gpt-4o-mini',
      });
      
      // Update state if component is still mounted
      if (isMounted.current) {
        state.setResponse(response);
        state.setStreamingResponse('');
        state.setModelInfo({
          model: response.meta.model,
          tokenCount: response.meta.tokenUsage,
          processingTime: response.meta.processingTime,
        });
        state.setLoading(false);
      }
      
      return response;
    } catch (error) {
      console.error('Error submitting question:', error);
      
      // Update error state if component is still mounted
      if (isMounted.current) {
        state.setError(
          error instanceof Error 
            ? error.message 
            : 'Failed to get a response. Please try again.'
        );
        state.setLoading(false);
      }
    }
  }, [state, isMounted, userId]);
  
  return { submitQuestion };
};
