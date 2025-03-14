
import { useState, useCallback } from 'react';
import { useAssistantState } from '@/components/ai-assistant/hooks/useAssistantState';
import { useQuestionSubmit } from '@/components/ai-assistant/hooks/useQuestionSubmit';
import { AIQuestion, AssistantSuggestion } from '@/components/ai-assistant/types';

interface UseAssistantProps {
  initialQuestion?: string;
  context?: string;
  componentName?: string;
}

/**
 * Custom hook for AI assistant functionality
 * This provides a unified interface for components to interact with the AI assistant
 */
export function useAssistant(props: UseAssistantProps = {}) {
  const { initialQuestion = '', context = '', componentName = '' } = props;
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AssistantSuggestion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Use the core assistant state
  const assistantState = useAssistantState();
  
  // Use the question submission hook
  const { submitQuestion, isLoading, error, tokenMetrics } = useQuestionSubmit();
  
  // Initialize with the initial question if provided
  useState(() => {
    if (initialQuestion) {
      assistantState.setQuestion(initialQuestion);
    }
  });
  
  // Handle submitting a question
  const handleSubmitQuestion = useCallback(async (questionText?: string) => {
    const textToSubmit = questionText || assistantState.question;
    
    if (!textToSubmit.trim()) return;
    
    // Create a question object
    const aiQuestion: AIQuestion = {
      text: textToSubmit,
      question: textToSubmit,
      userId: 'current-user', // This should be replaced with actual user ID in a real implementation
      context: context
    };
    
    // Submit the question
    return await submitQuestion(aiQuestion);
  }, [assistantState.question, context, submitQuestion]);
  
  // Analyze a component or code
  const analyzeComponent = useCallback(async (componentToAnalyze: string) => {
    setIsAnalyzing(true);
    
    try {
      // Create a specific question for component analysis
      const analysisQuestion = `Analyze the ${componentToAnalyze} component and suggest improvements.`;
      
      // Submit the analysis question
      await handleSubmitQuestion(analysisQuestion);
      
      // Here you would typically process the response to extract suggestions
      // For now, we'll mock some suggestions
      const mockSuggestions: AssistantSuggestion[] = [
        {
          id: '1',
          title: 'Improve performance',
          description: 'Consider memoizing expensive calculations',
          priority: 'medium',
          type: 'optimization',
          status: 'pending',
          component: componentToAnalyze,
          context: {
            component: componentToAnalyze
          }
        }
      ];
      
      setSuggestions(mockSuggestions);
      return mockSuggestions;
    } catch (error) {
      console.error('Error analyzing component:', error);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [handleSubmitQuestion]);
  
  // Dismiss a suggestion
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    if (selectedSuggestion?.id === suggestionId) {
      setSelectedSuggestion(null);
    }
  }, [selectedSuggestion]);
  
  // Implement a suggestion
  const implementSuggestion = useCallback(async (suggestion: AssistantSuggestion) => {
    // In a real implementation, this would communicate with the backend to implement the suggestion
    setSuggestions(prev => 
      prev.map(s => s.id === suggestion.id ? { ...s, status: 'implemented' } : s)
    );
  }, []);
  
  return {
    ...assistantState,
    submitQuestion: handleSubmitQuestion,
    isLoading,
    error,
    tokenMetrics,
    suggestions,
    selectedSuggestion,
    setSelectedSuggestion,
    isAnalyzing,
    analyzeComponent,
    dismissSuggestion,
    implementSuggestion,
    currentComponent: componentName
  };
}

export default useAssistant;
