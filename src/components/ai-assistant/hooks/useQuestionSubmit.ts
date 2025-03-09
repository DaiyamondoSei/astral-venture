
import { useCallback } from 'react';
import { processQuestion, askAIAssistant } from '@/services/ai/assistant';
import { AIQuestion, AIResponse, AIQuestionOptions } from '@/services/ai/types';

interface AssistantState {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResponse: (response: AIResponse) => void;
  setStreamingResponse: (text: string | null) => void;
  setModelInfo: (info: {model: string; tokens: number} | null) => void;
}

interface UseQuestionSubmitProps {
  state: AssistantState;
  reflectionContext?: string;
  selectedReflectionId?: string;
  userId: string;
  isMounted: React.MutableRefObject<boolean>;
}

export const useQuestionSubmit = ({
  state,
  reflectionContext,
  selectedReflectionId,
  userId,
  isMounted
}: UseQuestionSubmitProps) => {
  
  const submitQuestion = useCallback(async (question: string) => {
    if (!question.trim() || !userId) return null;
    
    try {
      if (isMounted.current) {
        state.setLoading(true);
        state.setError(null);
        state.setStreamingResponse(null);
      } else {
        return null;
      }
      
      console.log("Submitting question:", {
        question,
        reflectionContext,
        selectedReflectionId,
        userId,
        isOnline: navigator.onLine
      });
      
      // Check online status before proceeding
      if (!navigator.onLine) {
        console.log("Device is offline, will use fallback response");
      }
      
      // Prepare question data
      const questionData: AIQuestion = {
        text: question,
        question,
        reflectionIds: selectedReflectionId ? [selectedReflectionId] : [],
        context: reflectionContext || '',
        stream: navigator.onLine // Only enable streaming if online
      };
      
      // Create options object
      const options: AIQuestionOptions = {}; 
      
      // Call the API
      const aiResponse = await askAIAssistant(questionData, options);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        // Set response in state
        state.setResponse(aiResponse);
        
        // Set model info if available
        if (aiResponse.meta) {
          state.setModelInfo({
            model: aiResponse.meta.model,
            tokens: aiResponse.meta.tokenUsage
          });
        }
      }
      
      return aiResponse;
    } catch (error) {
      console.error("Error submitting question:", error);
      if (isMounted.current) {
        state.setError(error instanceof Error ? error.message : "An unknown error occurred");
      }
      return null;
    } finally {
      if (isMounted.current) {
        state.setLoading(false);
      }
    }
  }, [state, reflectionContext, selectedReflectionId, userId, isMounted]);

  return { submitQuestion };
};
