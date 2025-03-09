
import { useState, useCallback } from 'react';
import { AICodeAssistant } from '@/utils/ai/AICodeAssistant';
import { AssistantSuggestion, AssistantIntent } from '@/services/ai/types';

interface UseAICodeAssistantProps {
  componentId?: string;
}

interface AICodeAssistantState {
  suggestions: AssistantSuggestion[];
  intents: AssistantIntent[];
  selectedSuggestion: AssistantSuggestion | null;
  isAnalyzing: boolean;
  isFixing: boolean;
}

/**
 * Hook for AI code assistant functionality
 */
export function useAICodeAssistant({ componentId }: UseAICodeAssistantProps = {}) {
  const [state, setState] = useState<AICodeAssistantState>({
    suggestions: [],
    intents: [],
    selectedSuggestion: null,
    isAnalyzing: false,
    isFixing: false
  });
  
  // Create a singleton instance of AICodeAssistant
  const assistant = new AICodeAssistant();
  
  // Analyze current component
  const analyzeComponent = useCallback(async (componentId: string) => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    
    try {
      // Get suggestions for the component
      const suggestions = await assistant.getSuggestions(componentId);
      
      setState(prev => ({
        ...prev,
        suggestions,
        isAnalyzing: false
      }));
    } catch (error) {
      console.error('Error analyzing component:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [assistant]);
  
  // Get suggestions for multiple components
  const analyzeComponents = useCallback(async (componentIds: string[]) => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    
    try {
      // Get all intents
      const intents = await assistant.getIntents();
      
      setState(prev => ({
        ...prev,
        intents,
        isAnalyzing: false
      }));
    } catch (error) {
      console.error('Error analyzing components:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [assistant]);
  
  // Register a new intent
  const registerIntent = useCallback(async (intent: Omit<AssistantIntent, 'id' | 'created' | 'status'>) => {
    try {
      await assistant.registerIntent(intent);
      
      // Refresh intents
      const intents = await assistant.getIntents();
      setState(prev => ({ ...prev, intents }));
      
      return true;
    } catch (error) {
      console.error('Error registering intent:', error);
      return false;
    }
  }, [assistant]);
  
  // Select a suggestion
  const selectSuggestion = useCallback((suggestion: AssistantSuggestion) => {
    setState(prev => ({ ...prev, selectedSuggestion: suggestion }));
  }, []);
  
  // Clear selected suggestion
  const clearSelectedSuggestion = useCallback(() => {
    setState(prev => ({ ...prev, selectedSuggestion: null }));
  }, []);
  
  // Apply auto-fix for a suggestion
  const applyAutoFix = useCallback(async (suggestion: AssistantSuggestion) => {
    if (!suggestion) return false;
    
    setState(prev => ({ ...prev, isFixing: true }));
    
    try {
      const result = await assistant.applyAutoFix(suggestion.id);
      
      setState(prev => ({ ...prev, isFixing: false }));
      return result;
    } catch (error) {
      console.error('Error applying auto-fix:', error);
      setState(prev => ({ ...prev, isFixing: false }));
      return false;
    }
  }, [assistant]);
  
  // Mark an intent as implemented
  const markIntentAsImplemented = useCallback(async (intentId: string) => {
    try {
      await assistant.updateIntentStatus(intentId, 'completed');
      
      // Refresh intents
      const intents = await assistant.getIntents();
      setState(prev => ({ ...prev, intents }));
      
      return true;
    } catch (error) {
      console.error('Error marking intent as implemented:', error);
      return false;
    }
  }, [assistant]);
  
  // Mark an intent as abandoned
  const markIntentAsAbandoned = useCallback(async (intentId: string) => {
    try {
      await assistant.updateIntentStatus(intentId, 'failed');
      
      // Refresh intents
      const intents = await assistant.getIntents();
      setState(prev => ({ ...prev, intents }));
      
      return true;
    } catch (error) {
      console.error('Error marking intent as abandoned:', error);
      return false;
    }
  }, [assistant]);
  
  // Initial analysis if component ID is provided
  useState(() => {
    if (componentId) {
      analyzeComponent(componentId);
    }
  });
  
  return {
    ...state,
    analyzeComponent,
    analyzeComponents,
    registerIntent,
    selectSuggestion,
    clearSelectedSuggestion,
    applyAutoFix,
    markIntentAsImplemented,
    markIntentAsAbandoned,
    updateContext: (context: string) => assistant.updateContext?.(context)
  };
}
