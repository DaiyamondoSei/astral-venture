
import { useState, useEffect, useCallback } from 'react';
import { aiCodeAssistant, AssistantSuggestion, AssistantIntent } from '@/utils/ai/AICodeAssistant';
import type { UseAICodeAssistantProps } from '@/services/ai/types';

export function useAICodeAssistant(props?: UseAICodeAssistantProps) {
  const {
    initialComponents = [],
    autoAnalyze = true,
    analysisDepth = 'shallow'
  } = props || {};

  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [intents, setIntents] = useState<AssistantIntent[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentComponent, setCurrentComponent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize and run initial analysis if configured
  useEffect(() => {
    if (autoAnalyze && initialComponents.length > 0) {
      analyzeComponents(initialComponents).catch(err => {
        setError(`Analysis error: ${err.message}`);
      });
    }
    
    // Initialize intents
    loadIntents();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Analyze a specific component
  const analyzeComponent = useCallback(async (componentId: string) => {
    setIsAnalyzing(true);
    setCurrentComponent(componentId);
    setError(null);
    
    try {
      const componentSuggestions = await aiCodeAssistant.analyzeComponent(componentId);
      
      // Update suggestions state with the new suggestions
      setSuggestions(prevSuggestions => {
        // Remove any existing suggestions for this component
        const filteredSuggestions = prevSuggestions.filter(s => s.component !== componentId);
        // Add the new suggestions
        return [...filteredSuggestions, ...componentSuggestions];
      });
      
      return componentSuggestions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during analysis';
      setError(errorMessage);
      return [];
    } finally {
      setIsAnalyzing(false);
      setCurrentComponent(null);
    }
  }, []);

  // Analyze multiple components
  const analyzeComponents = useCallback(async (componentIds: string[]) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const results = await Promise.all(
        componentIds.map(async (id) => {
          setCurrentComponent(id);
          return await aiCodeAssistant.analyzeComponent(id);
        })
      );
      
      // Flatten results and update suggestions
      const allSuggestions = results.flat();
      
      setSuggestions(prevSuggestions => {
        // Remove existing suggestions for analyzed components
        const filteredSuggestions = prevSuggestions.filter(
          s => !componentIds.includes(s.component || '')
        );
        // Add new suggestions
        return [...filteredSuggestions, ...allSuggestions];
      });
      
      return allSuggestions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during analysis';
      setError(errorMessage);
      return [];
    } finally {
      setIsAnalyzing(false);
      setCurrentComponent(null);
    }
  }, []);

  // Refresh suggestions
  const refreshSuggestions = useCallback(async () => {
    setError(null);
    
    try {
      // Get current suggestions and re-analyze their components
      const components = [...new Set(suggestions.map(s => s.component || '').filter(Boolean))];
      
      if (components.length === 0) {
        return [];
      }
      
      return await analyzeComponents(components);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during refresh';
      setError(errorMessage);
      return [];
    }
  }, [suggestions, analyzeComponents]);

  // Load all intents
  const loadIntents = useCallback(async () => {
    setIntents(aiCodeAssistant.getIntents());
  }, []);

  // Register a new intent
  const registerIntent = useCallback(async (intent: Omit<AssistantIntent, 'id' | 'created' | 'status'>) => {
    try {
      const newIntent = await aiCodeAssistant.registerIntent(intent);
      
      // Update intents state
      setIntents(aiCodeAssistant.getIntents());
      
      return newIntent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error registering intent';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Mark an intent as implemented
  const markIntentImplemented = useCallback(async (intentId: string) => {
    try {
      const updatedIntent = await aiCodeAssistant.updateIntentStatus(intentId, 'implemented');
      
      if (updatedIntent) {
        // Update intents state
        setIntents(aiCodeAssistant.getIntents());
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error updating intent';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Mark an intent as abandoned
  const markIntentAbandoned = useCallback(async (intentId: string) => {
    try {
      const updatedIntent = await aiCodeAssistant.updateIntentStatus(intentId, 'abandoned');
      
      if (updatedIntent) {
        // Update intents state
        setIntents(aiCodeAssistant.getIntents());
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error updating intent';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Apply a fix for a suggestion
  const applyFix = useCallback(async (suggestionId: string) => {
    try {
      const result = await aiCodeAssistant.applyFix(suggestionId);
      
      if (result) {
        // Update suggestions by removing the fixed suggestion
        setSuggestions(prevSuggestions => 
          prevSuggestions.filter(s => s.id !== suggestionId)
        );
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error applying fix';
      setError(errorMessage);
      return false;
    }
  }, []);

  return {
    suggestions,
    intents,
    isAnalyzing,
    currentComponent,
    error,
    isFixing: aiCodeAssistant.getIsFixing(),
    analyzeComponent,
    analyzeComponents,
    refreshSuggestions,
    registerIntent,
    markIntentImplemented,
    markIntentAbandoned,
    applyFix
  };
}

export default useAICodeAssistant;
