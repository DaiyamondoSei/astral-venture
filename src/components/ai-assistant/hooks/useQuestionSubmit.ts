
import { useCallback } from 'react';
import { askAIAssistant } from '@/services/ai/assistant';
import { AIQuestion, AIResponse } from '@/services/ai/types';

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
}

export const useQuestionSubmit = ({
  state,
  reflectionContext,
  selectedReflectionId,
  userId
}: UseQuestionSubmitProps) => {
  
  const submitQuestion = useCallback(async (question: string) => {
    if (!question.trim() || !userId) return null;
    
    try {
      state.setLoading(true);
      state.setError(null);
      state.setStreamingResponse(null);
      
      console.log("Submitting question:", {
        question,
        reflectionContext,
        selectedReflectionId,
        userId
      });
      
      // Prepare question data
      const questionData: AIQuestion = {
        question,
        reflectionIds: selectedReflectionId ? [selectedReflectionId] : [],
        context: reflectionContext || '',
        stream: true // Enable streaming by default
      };
      
      // Call the API
      const aiResponse = await askAIAssistant(questionData, userId);
      
      // Set response in state
      state.setResponse(aiResponse);
      
      // Set model info if available
      if (aiResponse.meta) {
        state.setModelInfo({
          model: aiResponse.meta.model,
          tokens: aiResponse.meta.tokenUsage
        });
      }
      
      return aiResponse;
    } catch (error) {
      console.error("Error submitting question:", error);
      state.setError(error instanceof Error ? error.message : "An unknown error occurred");
      return null;
    } finally {
      state.setLoading(false);
    }
  }, [state, reflectionContext, selectedReflectionId, userId]);

  return { submitQuestion };
};
