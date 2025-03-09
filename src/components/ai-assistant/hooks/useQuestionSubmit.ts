
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

// Queue for tracking pending requests to prevent duplicates
const pendingRequests = new Set<string>();

/**
 * Hook for submitting questions to the AI assistant
 * Optimized for performance and UX
 */
export const useQuestionSubmit = ({
  state,
  reflectionContext,
  selectedReflectionId,
  userId,
  isMounted
}: UseQuestionSubmitProps) => {
  
  // Memoized submit function to prevent recreating on every render
  const submitQuestion = useCallback(async (question: string) => {
    // Validate inputs
    if (!question.trim() || !userId) {
      console.log('Invalid question or missing userId');
      return null;
    }
    
    // Generate a request ID to prevent duplicate submissions
    const requestId = `${userId}:${question}:${Date.now()}`;
    
    // Check if this exact request is already pending
    if (pendingRequests.has(requestId)) {
      console.log('Duplicate request prevented');
      return null;
    }
    
    pendingRequests.add(requestId);
    
    try {
      if (isMounted.current) {
        state.setLoading(true);
        state.setError(null);
        state.setStreamingResponse(null);
      } else {
        pendingRequests.delete(requestId);
        return null;
      }
      
      console.log("Submitting question:", {
        question,
        reflectionContext: reflectionContext ? `${reflectionContext.substring(0, 20)}...` : null,
        selectedReflectionId,
        userId,
        isOnline: navigator.onLine
      });
      
      // Check online status before proceeding
      if (!navigator.onLine) {
        console.log("Device is offline, will use fallback response");
      }
      
      // Performance tracking
      const startTime = performance.now();
      
      // Prepare question data
      const questionData: AIQuestion = {
        text: question,
        question,
        reflectionIds: selectedReflectionId ? [selectedReflectionId] : [],
        context: reflectionContext || '',
        stream: navigator.onLine // Only enable streaming if online
      };
      
      // Create options object with timeout
      const options: AIQuestionOptions = {
        maxTokens: 1200 // Limit token usage for better performance
      }; 
      
      // Call the API
      const aiResponse = await askAIAssistant(questionData, options);
      
      const responseTime = performance.now() - startTime;
      console.log(`AI response received in ${responseTime.toFixed(2)}ms`);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        // Set response in state
        state.setResponse(aiResponse);
        
        // Set model info if available
        if (aiResponse.meta) {
          state.setModelInfo({
            model: aiResponse.meta.model || "unknown",
            tokens: aiResponse.meta.tokenUsage || 0
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
      pendingRequests.delete(requestId);
    }
  }, [state, reflectionContext, selectedReflectionId, userId, isMounted]);

  return { submitQuestion };
};
