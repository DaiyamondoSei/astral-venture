
import { useState, useCallback, useEffect } from 'react';
import { AssistantSuggestion } from '@/components/ai-assistant/types';
import { aiCodeAssistant } from '@/utils/ai/AICodeAssistant';

/**
 * Props for the useAssistant hook
 */
export interface UseAssistantProps {
  componentName?: string;
}

/**
 * Return type for the useAssistant hook
 */
export interface UseAssistantResult {
  // Loading states
  isLoading: boolean;
  loading: boolean; // Alias for backward compatibility
  
  // Response and data
  data: any;
  response: string; // HTML formatted response
  tokens: number;
  
  // Question handling
  question: string;
  setQuestion: (question: string) => void;
  submitQuestion: (question: string) => Promise<void>;
  
  // Code analysis
  suggestions: AssistantSuggestion[];
  currentComponent: string;
  isAnalyzing: boolean;
  analyzeComponent: (componentName: string) => Promise<AssistantSuggestion[]>;
  
  // Error handling
  error: string;
  
  // Code fixing
  isFixing: boolean;
  applyFix: (suggestion: AssistantSuggestion) => Promise<boolean>;
  applyAutoFix: (suggestion: AssistantSuggestion) => Promise<boolean>;
  
  // Metadata
  lastUpdated: Date;
}

/**
 * Hook for interacting with the AI assistant
 */
export function useAssistant({ componentName = '' }: UseAssistantProps = {}): UseAssistantResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [tokens, setTokens] = useState(0);
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [currentComponent, setCurrentComponent] = useState(componentName || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Fetch suggestions on component change
  useEffect(() => {
    if (componentName && componentName !== currentComponent) {
      setCurrentComponent(componentName);
      fetchSuggestions(componentName);
    }
  }, [componentName]);
  
  // Fetch suggestions for a component
  const fetchSuggestions = async (componentId: string) => {
    if (!componentId) return;
    
    try {
      setIsAnalyzing(true);
      const results = await aiCodeAssistant.analyzeComponent(componentId);
      setSuggestions(results);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error analyzing component:', err);
      setError('Failed to analyze component');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Analyze component and fetch suggestions
  const analyzeComponent = async (componentId: string) => {
    try {
      setIsAnalyzing(true);
      const results = await aiCodeAssistant.analyzeComponent(componentId);
      setSuggestions(results);
      setCurrentComponent(componentId);
      setLastUpdated(new Date());
      return results;
    } catch (err) {
      console.error('Error analyzing component:', err);
      setError('Failed to analyze component');
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Apply fix for a suggestion
  const applyFix = async (suggestion: AssistantSuggestion) => {
    try {
      setIsFixing(true);
      const success = await aiCodeAssistant.applyFix(suggestion.id);
      if (success) {
        // Remove the fixed suggestion from the list
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
        setLastUpdated(new Date());
      }
      return success;
    } catch (err) {
      console.error('Error applying fix:', err);
      setError('Failed to apply fix');
      return false;
    } finally {
      setIsFixing(false);
    }
  };
  
  // Apply auto fix for a suggestion (alias for backward compatibility)
  const applyAutoFix = applyFix;
  
  // Submit a question to the AI assistant
  const submitQuestion = async (questionText: string) => {
    if (!questionText.trim()) return;
    
    try {
      setIsLoading(true);
      setQuestion(questionText);
      
      // Simulate response for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResponse(`<p>This is a simulated response to your question: "${questionText}"</p>`);
      setTokens(Math.floor(Math.random() * 500) + 100);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error submitting question:', err);
      setError('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    // Loading states
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    
    // Response and data
    data: response,
    response,
    tokens,
    
    // Question handling
    question,
    setQuestion,
    submitQuestion,
    
    // Code analysis
    suggestions,
    currentComponent,
    isAnalyzing,
    analyzeComponent,
    
    // Error handling
    error,
    
    // Code fixing
    isFixing,
    applyFix,
    applyAutoFix,
    
    // Metadata
    lastUpdated
  };
}

export default useAssistant;
