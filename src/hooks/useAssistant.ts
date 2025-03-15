
import { useState, useCallback } from 'react';
import { 
  AIResponse, 
  AssistantSuggestion, 
  AIQuestion 
} from '@/services/ai/types';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

/**
 * Interface for the useAssistant hook return value 
 */
export interface UseAssistantReturn {
  isLoading: boolean;
  tokens: number;
  data: any;
  suggestions: AssistantSuggestion[];
  error: string;
  isFixing: boolean;
  currentComponent: string;
  loading: boolean;
  lastUpdated: Date;
  response: AIResponse | null;
  question: string;
  isAnalyzing: boolean;
  
  // Methods
  setQuestion: (question: string) => void;
  submitQuestion: (context?: string) => Promise<void>;
  analyzeComponent: (componentCode: string) => Promise<void>;
  applyFix: (suggestion: AssistantSuggestion) => Promise<void>;
  applyAutoFix: (suggestionId: string) => Promise<void>;
}

/**
 * AI Assistant hook for developer assistance and code improvements
 */
export function useAssistant(): UseAssistantReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState(0);
  const [data, setData] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [error, setError] = useState('');
  const [isFixing, setIsFixing] = useState(false);
  const [currentComponent, setCurrentComponent] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [question, setQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { toast } = useToast();

  /**
   * Submit a question to the AI Assistant
   */
  const submitQuestion = useCallback(async (context?: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const questionData: AIQuestion = {
        text: question,
        question,
        userId: 'current-user', // This should be dynamically set in a real app
        context: context || '',
        stream: false
      };
      
      const { data, error } = await supabase.functions.invoke('ask-assistant', {
        body: questionData
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setResponse(data as AIResponse);
      setTokens(data.meta?.tokenUsage || 0);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [question, toast]);

  /**
   * Analyze a component for suggestions
   */
  const analyzeComponent = useCallback(async (componentCode: string) => {
    setIsAnalyzing(true);
    setCurrentComponent(componentCode);
    
    try {
      // This would call your actual API endpoint for code analysis
      const { data, error } = await supabase.functions.invoke('analyze-code', {
        body: { code: componentCode }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setSuggestions(data.suggestions || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Apply a fix for a suggestion
   */
  const applyFix = useCallback(async (suggestion: AssistantSuggestion) => {
    setIsFixing(true);
    
    try {
      // This would call your actual API endpoint for fixing code
      const { data, error } = await supabase.functions.invoke('apply-fix', {
        body: { suggestionId: suggestion.id, component: currentComponent }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update with the fixed code
      setData(data);
      toast({
        title: "Fix Applied",
        description: `Successfully applied: ${suggestion.title}`,
      });
      
      // Update the suggestion as implemented
      setSuggestions(prev => 
        prev.map(s => 
          s.id === suggestion.id 
            ? { ...s, status: 'implemented' } 
            : s
        )
      );
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to apply fix',
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  }, [currentComponent, toast]);

  /**
   * Apply an automatic fix by suggestion ID
   */
  const applyAutoFix = useCallback(async (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) {
      toast({
        title: "Error",
        description: "Suggestion not found",
        variant: "destructive"
      });
      return;
    }
    
    await applyFix(suggestion);
  }, [suggestions, applyFix, toast]);

  return {
    isLoading,
    tokens,
    data,
    suggestions,
    error,
    isFixing,
    currentComponent,
    loading,
    lastUpdated,
    response,
    question,
    isAnalyzing,
    setQuestion,
    submitQuestion,
    analyzeComponent,
    applyFix,
    applyAutoFix
  };
}

export default useAssistant;
