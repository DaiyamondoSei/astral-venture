
import { useState, useEffect, useCallback } from 'react';
import { aiCodeAssistant, AssistantSuggestion, AssistantIntent } from '@/utils/ai/AICodeAssistant';
import { aiAssistantContext } from '@/utils/ai/AIAssistantContext';
import { toast } from '@/components/ui/use-toast';

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
    showToasts?: boolean;
  } = {}
) {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    trackIntent,
    showToasts = true
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
      markIntentAbandoned: () => false,
      getCurrentContext: () => ({})
    };
  }
  
  // Load suggestions and intents
  const refreshSuggestions = useCallback(() => {
    setLoading(true);
    
    if (componentName) {
      // Update context with current component
      aiAssistantContext.setCurrentComponent(componentName);
      
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
  }, [componentName]);
  
  // Helper functions
  const registerIntent = useCallback((description: string, relatedComponents: string[] = []): string => {
    const intentId = aiCodeAssistant.registerIntent(description, relatedComponents);
    
    // Also register in the context
    aiAssistantContext.registerIntent({
      description,
      priority: 'medium',
      category: 'feature',
      status: 'pending',
      components: relatedComponents
    });
    
    refreshSuggestions();
    
    if (showToasts) {
      toast({
        title: "Development intent tracked",
        description: description.length > 50 ? `${description.substring(0, 47)}...` : description,
      });
    }
    
    return intentId;
  }, [refreshSuggestions, showToasts]);
  
  const applyAutoFix = useCallback((suggestionId: string): boolean => {
    const result = aiCodeAssistant.applyAutoFix(suggestionId);
    
    if (result) {
      refreshSuggestions();
      
      if (showToasts) {
        toast({
          title: "Auto-fix applied",
          description: "The suggested code improvement has been applied.",
        });
      }
    } else if (showToasts) {
      toast({
        title: "Auto-fix failed",
        description: "Unable to apply the suggested fix automatically.",
        variant: "destructive"
      });
    }
    
    return result;
  }, [refreshSuggestions, showToasts]);
  
  const markIntentImplemented = useCallback((intentId: string): boolean => {
    const result = aiCodeAssistant.updateIntentStatus(intentId, 'implemented');
    
    // Also update in context
    aiAssistantContext.updateIntent(intentId, { status: 'implemented' });
    
    if (result) {
      refreshSuggestions();
      
      if (showToasts) {
        toast({
          title: "Intent marked as implemented",
          description: "Development intent has been completed.",
        });
      }
    }
    
    return result;
  }, [refreshSuggestions, showToasts]);
  
  const markIntentAbandoned = useCallback((intentId: string): boolean => {
    const result = aiCodeAssistant.updateIntentStatus(intentId, 'abandoned');
    
    // Also update in context
    aiAssistantContext.updateIntent(intentId, { status: 'abandoned' });
    
    if (result) {
      refreshSuggestions();
      
      if (showToasts) {
        toast({
          title: "Intent marked as abandoned",
          description: "Development intent has been abandoned.",
        });
      }
    }
    
    return result;
  }, [refreshSuggestions, showToasts]);
  
  const getCurrentContext = useCallback(() => {
    return aiAssistantContext.getContext();
  }, []);
  
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
  }, [componentName, autoRefresh, refreshInterval, refreshSuggestions]);
  
  // Track specific intent if provided
  useEffect(() => {
    if (trackIntent) {
      // Update context with current intent
      aiCodeAssistant.updateContext({
        currentIntent: trackIntent,
        componentName
      });
      
      // Also update the assistant context
      aiAssistantContext.updateContext({
        currentComponent: componentName,
        currentIntent: trackIntent
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
    markIntentAbandoned,
    getCurrentContext
  };
}

export default useAICodeAssistant;
