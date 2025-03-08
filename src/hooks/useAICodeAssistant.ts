
import { useState, useEffect } from 'react';
import { aiCodeAssistant, AssistantSuggestion, AssistantIntent } from '@/utils/ai/AICodeAssistant';

/**
 * Hook for interacting with the AI Code Assistant
 * 
 * Provides access to intelligent code suggestions, intent tracking,
 * and automated fixes based on code analysis
 */
export function useAICodeAssistant(
  componentName?: string,
  options: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    trackIntent?: string;
  } = {}
) {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    trackIntent
  } = options;
  
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [intents, setIntents] = useState<AssistantIntent[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Skip in production
  if (process.env.NODE_ENV !== 'development') {
    return {
      suggestions: [],
      intents: [],
      loading: false,
      lastUpdated: null,
      refreshSuggestions: () => {},
      registerIntent: () => '',
      applyAutoFix: () => false,
      markIntentImplemented: () => false,
      markIntentAbandoned: () => false
    };
  }
  
  // Load suggestions and intents
  const refreshSuggestions = () => {
    setLoading(true);
    
    if (componentName) {
      // Get suggestions for specific component
      const componentSuggestions = aiCodeAssistant.getSuggestionsForComponent(componentName);
      setSuggestions(componentSuggestions);
    } else {
      // Get all suggestions
      const allSuggestions = aiCodeAssistant.generateSuggestions();
      setSuggestions(allSuggestions);
    }
    
    // Get all intents
    const currentIntents = aiCodeAssistant.getIntents();
    setIntents(currentIntents);
    
    setLastUpdated(new Date());
    setLoading(false);
  };
  
  // Helper functions
  const registerIntent = (description: string, relatedComponents: string[] = []): string => {
    const intentId = aiCodeAssistant.registerIntent(description, relatedComponents);
    refreshSuggestions();
    return intentId;
  };
  
  const applyAutoFix = (suggestionId: string): boolean => {
    const result = aiCodeAssistant.applyAutoFix(suggestionId);
    if (result) {
      refreshSuggestions();
    }
    return result;
  };
  
  const markIntentImplemented = (intentId: string): boolean => {
    const result = aiCodeAssistant.updateIntentStatus(intentId, 'implemented');
    if (result) {
      refreshSuggestions();
    }
    return result;
  };
  
  const markIntentAbandoned = (intentId: string): boolean => {
    const result = aiCodeAssistant.updateIntentStatus(intentId, 'abandoned');
    if (result) {
      refreshSuggestions();
    }
    return result;
  };
  
  // Initial load and auto refresh
  useEffect(() => {
    refreshSuggestions();
    
    // Set up auto-refresh if enabled
    if (autoRefresh) {
      const intervalId = setInterval(() => {
        refreshSuggestions();
      }, refreshInterval);
      
      return () => clearInterval(intervalId);
    }
  }, [componentName, autoRefresh, refreshInterval]);
  
  // Track specific intent if provided
  useEffect(() => {
    if (trackIntent) {
      // Update context with current intent
      aiCodeAssistant.updateContext({
        currentIntent: trackIntent,
        componentName
      });
    }
  }, [trackIntent, componentName]);
  
  return {
    suggestions,
    intents,
    loading,
    lastUpdated,
    refreshSuggestions,
    registerIntent,
    applyAutoFix,
    markIntentImplemented,
    markIntentAbandoned
  };
}

export default useAICodeAssistant;
