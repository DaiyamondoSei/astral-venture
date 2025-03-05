
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
    
    try {
      const aiResponse = await askAIAssistant({
        question,
        context: reflectionContext,
        reflectionIds: selectedReflectionId ? [selectedReflectionId] : undefined
      }, user.id);
      
      // Validate that we have a properly structured response before setting state
      if (!aiResponse || typeof aiResponse.answer !== 'string') {
        throw new Error('Invalid response format from AI assistant');
      }
      
      // Ensure suggestedPractices is an array
      if (aiResponse.suggestedPractices && !Array.isArray(aiResponse.suggestedPractices)) {
        aiResponse.suggestedPractices = [];
      }
      
      setResponse(aiResponse);
    } catch (error) {
      console.error('Error submitting question:', error);
      setError('Failed to connect to AI assistant');
      toast({
        title: "Couldn't connect to AI assistant",
        description: "Please try again later.",
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
  };

  return {
    question,
    setQuestion,
    response,
    loading,
    error,
    handleSubmitQuestion,
    reset,
    user
  };
};

export default useAIAssistant;
