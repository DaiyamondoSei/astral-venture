
import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAssistantState } from './useAssistantState';
import { useQuestionSubmit } from './useQuestionSubmit';

interface UseAIAssistantProps {
  reflectionContext?: string;
  selectedReflectionId?: string;
  open: boolean;
}

export const useAIAssistant = ({ 
  reflectionContext, 
  selectedReflectionId,
  open
}: UseAIAssistantProps) => {
  const { user } = useAuth();
  const state = useAssistantState();
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Set isMounted to true when the component mounts
    isMounted.current = true;
    
    // Set isMounted to false when the component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const { submitQuestion } = useQuestionSubmit({
    state,
    reflectionContext,
    selectedReflectionId,
    userId: user?.id || ''
  });
  
  // Reset the state when the dialog opens/closes
  useEffect(() => {
    if (!open) {
      // Small delay to ensure smooth animation
      const timeout = setTimeout(() => {
        if (isMounted.current) {
          state.reset();
        }
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [open, state]);

  const handleSubmitQuestion = useCallback(async () => {
    if (state.question.trim() && user?.id) {
      await submitQuestion(state.question);
    }
  }, [state.question, submitQuestion, user]);

  return {
    question: state.question,
    setQuestion: state.setQuestion,
    response: state.response,
    loading: state.loading,
    error: state.error,
    handleSubmitQuestion,
    reset: state.reset,
    user,
    streamingResponse: state.streamingResponse,
    modelInfo: state.modelInfo
  };
};

export default useAIAssistant;
