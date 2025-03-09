
/**
 * Hook for using AI code assistant capabilities
 */
import { useState, useCallback, useEffect } from 'react';
import { AICodeAssistant } from '@/utils/ai/AICodeAssistant';
import { AssistantSuggestion, AssistantIntent, UseAICodeAssistantProps } from '@/services/ai/types';

export function useAICodeAssistant(props?: UseAICodeAssistantProps) {
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [intents, setIntents] = useState<AssistantIntent[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Initialize the AI code assistant
  const assistant = new AICodeAssistant();
  
  // Analyze a single component
  const analyzeComponent = useCallback(async (componentId: string) => {
    try {
      setIsAnalyzing(true);
      setLoading(true);
      setSelectedComponent(componentId);
      
      // Perform the analysis
      await assistant.analyzeComponent(componentId);
      
      // Update suggestions
      const newSuggestions = assistant.getSuggestions();
      setSuggestions(newSuggestions);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error analyzing component:', error);
    } finally {
      setIsAnalyzing(false);
      setLoading(false);
    }
  }, [assistant]);
  
  // Analyze multiple components
  const analyzeComponents = useCallback(async (componentIds: string[]) => {
    try {
      setIsAnalyzing(true);
      setLoading(true);
      
      // Analyze each component
      await Promise.all(componentIds.map(id => assistant.analyzeComponent(id)));
      
      // Update suggestions
      const newSuggestions = assistant.getSuggestions();
      setSuggestions(newSuggestions);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error analyzing components:', error);
    } finally {
      setIsAnalyzing(false);
      setLoading(false);
    }
  }, [assistant]);
  
  // Refresh suggestions
  const refreshSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get updated suggestions
      const newSuggestions = assistant.getSuggestions();
      setSuggestions(newSuggestions);
      
      // Get updated intents
      const newIntents = assistant.getIntents();
      setIntents(newIntents);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, [assistant]);
  
  // Register an intent
  const registerIntent = useCallback(async (intent: Omit<AssistantIntent, 'id' | 'created' | 'status'>) => {
    try {
      const newIntent = await assistant.registerIntent(intent);
      
      // Update intents
      const updatedIntents = assistant.getIntents();
      setIntents(updatedIntents);
      
      return newIntent;
    } catch (error) {
      console.error('Error registering intent:', error);
      return null;
    }
  }, [assistant]);
  
  // Apply auto-fix for a suggestion
  const applyAutoFix = useCallback(async (suggestionId: string): Promise<boolean> => {
    try {
      setIsFixing(true);
      
      // Apply the auto-fix
      const result = await assistant.applyAutoFix(suggestionId);
      
      // Refresh suggestions
      const newSuggestions = assistant.getSuggestions();
      setSuggestions(newSuggestions);
      
      return result;
    } catch (error) {
      console.error('Error applying auto-fix:', error);
      return false;
    } finally {
      setIsFixing(false);
    }
  }, [assistant]);
  
  // Mark an intent as implemented
  const markIntentImplemented = useCallback(async (intentId: string): Promise<boolean> => {
    try {
      // Mark the intent as implemented
      await assistant.updateIntentStatus(intentId, 'completed');
      
      // Update intents
      const updatedIntents = assistant.getIntents();
      setIntents(updatedIntents);
      
      return true;
    } catch (error) {
      console.error('Error marking intent as implemented:', error);
      return false;
    }
  }, [assistant]);
  
  // Mark an intent as abandoned
  const markIntentAbandoned = useCallback(async (intentId: string): Promise<boolean> => {
    try {
      // Mark the intent as abandoned
      await assistant.updateIntentStatus(intentId, 'failed');
      
      // Update intents
      const updatedIntents = assistant.getIntents();
      setIntents(updatedIntents);
      
      return true;
    } catch (error) {
      console.error('Error marking intent as abandoned:', error);
      return false;
    }
  }, [assistant]);
  
  // Get suggestions for a specific component
  const getSuggestionsForComponent = useCallback((componentId: string): AssistantSuggestion[] => {
    return suggestions.filter(suggestion => suggestion.component === componentId);
  }, [suggestions]);
  
  // Update the context with new information
  const updateContext = useCallback((contextData: any) => {
    assistant.updateContext(contextData);
  }, [assistant]);
  
  // Initialize components if auto-analyze is enabled
  useEffect(() => {
    if (props?.autoAnalyze && props.initialComponents && props.initialComponents.length > 0) {
      analyzeComponents(props.initialComponents);
    }
    
    // Initial fetch of suggestions and intents
    refreshSuggestions();
  }, [props?.autoAnalyze, props?.initialComponents, analyzeComponents, refreshSuggestions]);
  
  return {
    suggestions,
    intents,
    isAnalyzing,
    isFixing,
    selectedComponent,
    loading,
    lastUpdated,
    analyzeComponent,
    analyzeComponents,
    refreshSuggestions,
    registerIntent,
    applyAutoFix,
    markIntentImplemented,
    markIntentAbandoned,
    getSuggestionsForComponent,
    updateContext
  };
}

export default useAICodeAssistant;
