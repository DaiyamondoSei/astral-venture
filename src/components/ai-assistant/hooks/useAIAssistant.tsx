
import { useState, useEffect } from 'react';
import { askAIAssistant, AIResponse } from '@/services/ai/aiService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingResponse, setStreamingResponse] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{model: string; tokens: number} | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Reset the state when the dialog opens/closes
  useEffect(() => {
    if (!open) {
      // Small delay to ensure smooth animation
      const timeout = setTimeout(() => {
        reset();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const handleSubmitQuestion = async () => {
    if (!question.trim() || !user) return;
    
    setLoading(true);
    setError(null);
    setStreamingResponse(null);
    
    try {
      console.log('Submitting question:', question);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 40000); // 40-second timeout
      
      // Determine if we should use streaming based on question length and complexity
      const shouldStream = question.length > 50;
      
      if (shouldStream) {
        // For streaming responses, we'll start collecting chunks
        try {
          // Start with an empty streaming response
          setStreamingResponse('');
          
          const aiResponse = await askAIAssistant({
            question,
            context: reflectionContext,
            reflectionIds: selectedReflectionId ? [selectedReflectionId] : undefined,
            stream: shouldStream
          }, user.id);
          
          // When streaming is complete, we'll have the full response
          setResponse(aiResponse);
          setStreamingResponse(null);
          
          // Set model info if available in the response
          if (aiResponse.meta && aiResponse.meta.model) {
            setModelInfo({
              model: aiResponse.meta.model,
              tokens: aiResponse.meta.tokenUsage || 0
            });
          }
        } catch (streamError) {
          console.error('Error during streaming:', streamError);
          setError('Failed to stream response');
        }
      } else {
        // For non-streaming responses, we'll just wait for the complete response
        const aiResponse = await askAIAssistant({
          question,
          context: reflectionContext,
          reflectionIds: selectedReflectionId ? [selectedReflectionId] : undefined
        }, user.id);
        
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
          setModelInfo({
            model: aiResponse.meta.model,
            tokens: aiResponse.meta.tokenUsage || 0
          });
        }
        
        setResponse(aiResponse);
      }
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Error submitting question:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to connect to AI assistant';
      
      // Determine specific error types
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'AI service quota exceeded. Please try again later.';
      } else if (error.message?.includes('rate limit')) {
        errorMessage = 'Rate limit reached. Please wait a moment and try again.';
      }
      
      setError(errorMessage);
      toast({
        title: "Couldn't connect to AI assistant",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuestion('');
    setResponse(null);
    setError(null);
    setStreamingResponse(null);
    setModelInfo(null);
  };

  return {
    question,
    setQuestion,
    response,
    loading,
    error,
    handleSubmitQuestion,
    reset,
    user,
    streamingResponse,
    modelInfo
  };
};

export default useAIAssistant;
