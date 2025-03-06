
import { askAIAssistant, AIResponse } from '@/services/ai/aiService';
import { useToast } from '@/components/ui/use-toast';

interface AssistantState {
  setLoading: (isLoading: boolean) => void;
  setStreamingResponse: (response: string | null) => void;
  setResponse: (response: AIResponse | null) => void;
  setError: (error: string | null) => void;
  setModelInfo: (info: {model: string; tokens: number} | null) => void;
}

interface UseQuestionSubmitProps {
  state: AssistantState;
  reflectionContext?: string;
  selectedReflectionId?: string;
  userId: string;
}

export function useQuestionSubmit({
  state,
  reflectionContext,
  selectedReflectionId,
  userId
}: UseQuestionSubmitProps) {
  const { toast } = useToast();
  
  const submitQuestion = async (question: string) => {
    if (!question.trim() || !userId) return;
    
    state.setLoading(true);
    state.setError(null);
    state.setStreamingResponse(null);
    
    try {
      console.log('Submitting question:', question);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 40000); // 40-second timeout
      
      // Determine if we should use streaming based on question length and complexity
      const shouldStream = question.length > 50;
      
      if (shouldStream) {
        // Start with an empty streaming response
        state.setStreamingResponse('');
        
        // Process streaming response
        try {
          // Append text as it comes in for streaming UI
          const appendToStream = (text: string) => {
            // Fix: Use functional update to properly append to streaming response
            state.setStreamingResponse((prev) => {
              return prev ? prev + text : text;
            });
          };
          
          // Set up interval to simulate streaming (until real streaming is implemented)
          let progress = '';
          const chunks = question.length > 100 ? 
            ['I\'m analyzing your question...', 
             '\n\nProcessing spiritual context...',
             '\n\nFormulating a response based on energy principles...'] : 
            ['Thinking...'];
          
          // Simulate streaming response with chunks
          for (const chunk of chunks) {
            await new Promise(resolve => setTimeout(resolve, 700));
            appendToStream(chunk);
          }
          
          // Now make the actual request
          const aiResponse = await askAIAssistant({
            question,
            context: reflectionContext,
            reflectionIds: selectedReflectionId ? [selectedReflectionId] : undefined,
            stream: shouldStream
          }, userId);
          
          // When streaming is complete, we'll have the full response
          state.setResponse(aiResponse);
          state.setStreamingResponse(null);
          
          // Set model info if available in the response
          if (aiResponse.meta && aiResponse.meta.model) {
            state.setModelInfo({
              model: aiResponse.meta.model,
              tokens: aiResponse.meta.tokenUsage || 0
            });
          }
        } catch (streamError) {
          console.error('Error during streaming:', streamError);
          state.setError('Failed to stream response');
        }
      } else {
        // For non-streaming responses, we'll just wait for the complete response
        const aiResponse = await askAIAssistant({
          question,
          context: reflectionContext,
          reflectionIds: selectedReflectionId ? [selectedReflectionId] : undefined
        }, userId);
        
        console.log('Received response:', aiResponse);
        
        // Validate that we have a properly structured response before setting state
        if (!aiResponse || typeof aiResponse.answer !== 'string') {
          throw new Error('Invalid response format from AI assistant');
        }
        
        // Ensure suggestedPractices is an array
        if (!aiResponse.suggestedPractices || !Array.isArray(aiResponse.suggestedPractices)) {
          aiResponse.suggestedPractices = [];
        }
        
        // Set model info if available in the response
        if (aiResponse.meta && aiResponse.meta.model) {
          state.setModelInfo({
            model: aiResponse.meta.model,
            tokens: aiResponse.meta.tokenUsage || 0
          });
        }
        
        state.setResponse(aiResponse);
      }
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Error submitting question:', error);
      
      // Enhanced error handling with more specific error types
      let errorMessage = 'Failed to connect to AI assistant';
      
      // Determine specific error types
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'AI service quota exceeded. Please try again later.';
      } else if (error.message?.includes('rate limit')) {
        errorMessage = 'Rate limit reached. Please wait a moment and try again.';
      } else if (error.message?.includes('offline') || !navigator.onLine) {
        errorMessage = 'You appear to be offline. Please check your connection.';
        // Also load offline fallback response
        const offlineFallback = createOfflineFallback(question);
        state.setResponse(offlineFallback);
      }
      
      state.setError(errorMessage);
      toast({
        title: "Couldn't connect to AI assistant",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      state.setLoading(false);
    }
  };
  
  return { submitQuestion };
}

// Generate a simple offline fallback when completely offline
function createOfflineFallback(question: string): AIResponse {
  return {
    answer: "You appear to be offline. Here's a general response based on common spiritual questions. Please try again when your connection is restored for a more personalized answer.",
    relatedInsights: [],
    suggestedPractices: [
      "Practice mindful breathing for 5-10 minutes",
      "Journal about your thoughts and feelings",
      "Connect with nature when possible"
    ],
    meta: {
      model: "offline",
      tokenUsage: 0,
      processingTime: 0
    }
  };
}
