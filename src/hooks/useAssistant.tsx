
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
  const [isFixing, setIsFixing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Use the core assistant state
  const assistantState = useAssistantState();
  
  // Use the question submission hook
  const { submitQuestion: submitQuestionToAPI, isLoading, error, tokenMetrics } = useQuestionSubmit();
  
  // Initialize with the initial question if provided
  useState(() => {
    if (initialQuestion) {
      assistantState.setQuestion(initialQuestion);
    }
  });
  
  // Handle submitting a question
  const submitQuestion = useCallback(async (questionText?: string) => {
    const textToSubmit = questionText || assistantState.question;
    
    if (!textToSubmit.trim()) return;
    
    // Create a question object
    const aiQuestion: AIQuestion = {
      text: textToSubmit,
      question: textToSubmit,
      userId: 'current-user', // This should be replaced with actual user ID in a real implementation
      context: context
    };
    
    // Submit the question and return the result directly
    const result = await submitQuestionToAPI(aiQuestion);
    return result;
  }, [assistantState.question, context, submitQuestionToAPI]);
  
  // Analyze a component or code
  const analyzeComponent = useCallback(async (componentToAnalyze: string) => {
    setIsAnalyzing(true);
    
    try {
      // Create a specific question for component analysis
      const analysisQuestion = `Analyze the ${componentToAnalyze} component and suggest improvements.`;
      
      // Submit the analysis question
      await submitQuestion(analysisQuestion);
      
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
      setLastUpdated(new Date());
      return mockSuggestions;
    } catch (error) {
      console.error('Error analyzing component:', error);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [submitQuestion]);
  
  // Dismiss a suggestion
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    if (selectedSuggestion?.id === suggestionId) {
      setSelectedSuggestion(null);
    }
    setLastUpdated(new Date());
  }, [selectedSuggestion]);
  
  // Implement a suggestion
  const implementSuggestion = useCallback(async (suggestion: AssistantSuggestion) => {
    // In a real implementation, this would communicate with the backend to implement the suggestion
    setSuggestions(prev => 
      prev.map(s => s.id === suggestion.id ? { ...s, status: 'implemented' } : s)
    );
    setLastUpdated(new Date());
    return Promise.resolve();
  }, []);

  // Apply a fix for a suggestion
  const applyFix = useCallback(async (suggestion: AssistantSuggestion) => {
    setIsFixing(true);
    try {
      // Simulate applying a fix
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuggestions(prev => 
        prev.map(s => s.id === suggestion.id ? { ...s, status: 'fixed' } : s)
      );
      setLastUpdated(new Date());
      return true;
    } catch (error) {
      console.error('Error applying fix:', error);
      return false;
    } finally {
      setIsFixing(false);
    }
  }, []);

  // Apply an auto fix for a suggestion
  const applyAutoFix = useCallback(async (suggestion: AssistantSuggestion) => {
    setIsFixing(true);
    try {
      // Simulate auto-fixing
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuggestions(prev => 
        prev.map(s => s.id === suggestion.id ? { ...s, status: 'fixed' } : s)
      );
      setLastUpdated(new Date());
      return true;
    } catch (error) {
      console.error('Error applying auto fix:', error);
      return false;
    } finally {
      setIsFixing(false);
    }
  }, []);
  
  return {
    // Properties from assistantState
    question: assistantState.question,
    setQuestion: assistantState.setQuestion,
    response: assistantState.response,
    
    // Submit function
    submitQuestion,
    
    // Loading states
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    isAnalyzing,
    isFixing,
    
    // Error information
    error,
    
    // Metrics
    tokenMetrics,
    tokens: tokenMetrics?.total || 0, // For backward compatibility
    
    // Data (alias for backward compatibility)
    data: assistantState.response,
    
    // Suggestions system
    suggestions,
    selectedSuggestion,
    setSelectedSuggestion,
    analyzeComponent,
    dismissSuggestion,
    implementSuggestion,
    applyFix,
    applyAutoFix,
    
    // Context
    currentComponent: componentName,
    lastUpdated
  };
}

export default useAssistant;
