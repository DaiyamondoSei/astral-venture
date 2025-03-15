
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { AIResponse, AIQuestion, AIQuestionOptions } from '@/components/ai-assistant/types';
import { AssistantSuggestion } from '@/services/ai/types';
import { submitAIQuestion } from '@/services/ai/assistantService';
import { applyAutoFix as applyCodeFix } from '@/services/ai/codeFixService';

export interface UseAssistantResult {
  // State values
  isLoading: boolean;
  isAnalyzing: boolean;
  isFixing: boolean;
  error: string;
  tokens: number;
  data: any;
  
  // Result data
  response: AIResponse | null;
  suggestions: AssistantSuggestion[];
  question: string;
  lastUpdated: Date;
  currentComponent: string;
  
  // Methods
  setQuestion: (q: string) => void;
  submitQuestion: (options?: AIQuestionOptions) => Promise<void>;
  applyFix: (suggestion: AssistantSuggestion) => Promise<boolean>;
  applyAutoFix: () => Promise<boolean>;
  clearResponse: () => void;
  analyze: (componentCode: string) => Promise<void>;
}

/**
 * Hook for interacting with the AI Assistant
 * Manages state, submissions, and actions related to AI assistance
 */
export function useAssistant(): UseAssistantResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [error, setError] = useState('');
  const [tokens, setTokens] = useState(0);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [question, setQuestion] = useState('');
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [currentComponent, setCurrentComponent] = useState('');
  const [data, setData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  /**
   * Submit a question to the AI Assistant
   */
  const submitQuestion = useCallback(async (options?: AIQuestionOptions) => {
    if (!question.trim()) {
      toast({
        title: "Empty Question",
        description: "Please enter a question to ask the assistant.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const aiQuestion: AIQuestion = {
        text: question,
        question: question,
        userId: 'current-user', // Replace with actual user ID in production
        context: options?.reflectionContent || '',
        stream: options?.stream || false
      };
      
      const result = await submitAIQuestion(aiQuestion, options);
      
      if (result.error) {
        setError(result.error.message || 'Failed to get assistant response');
        toast({
          title: "Error",
          description: result.error.message || 'Something went wrong',
          variant: "destructive",
        });
      } else if (result.data) {
        setResponse(result.data);
        setTokens(result.data.meta?.tokenUsage || 0);
        
        // Extract suggestions if available
        if (result.data.suggestions) {
          setSuggestions(result.data.suggestions);
        }
        
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast({
        title: "Error",
        description: err.message || 'Something went wrong',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [question]);

  /**
   * Apply a specific code fix suggestion
   */
  const applyFix = useCallback(async (suggestion: AssistantSuggestion): Promise<boolean> => {
    setIsFixing(true);
    try {
      // Implementation would call the code fix service
      // Placeholder for actual implementation
      console.log('Applying fix:', suggestion);
      
      toast({
        title: "Fix Applied",
        description: "The suggested fix has been applied.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to apply the fix',
        variant: "destructive",
      });
      return false;
    } finally {
      setIsFixing(false);
    }
  }, []);

  /**
   * Apply automatic fix for the current code
   */
  const applyAutoFix = useCallback(async (): Promise<boolean> => {
    if (!currentComponent) {
      toast({
        title: "Error",
        description: "No component selected for fixing",
        variant: "destructive",
      });
      return false;
    }
    
    setIsFixing(true);
    try {
      const result = await applyCodeFix(currentComponent);
      
      if (result.success) {
        toast({
          title: "Auto-Fix Applied",
          description: "Automatic fixes have been applied to the component.",
        });
        return true;
      } else {
        toast({
          title: "Auto-Fix Failed",
          description: result.error || "Couldn't apply automatic fixes",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to apply automatic fix',
        variant: "destructive",
      });
      return false;
    } finally {
      setIsFixing(false);
    }
  }, [currentComponent]);

  /**
   * Analyze a component's code
   */
  const analyze = useCallback(async (componentCode: string) => {
    setIsAnalyzing(true);
    setCurrentComponent(componentCode);
    
    try {
      // Analysis implementation would go here
      // Placeholder for actual implementation
      console.log('Analyzing component:', componentCode.substring(0, 50) + '...');
      
      setTimeout(() => {
        // Simulate analysis result
        setSuggestions([
          {
            id: 'suggestion-1',
            type: 'code-improvement',
            title: 'Optimize component rendering',
            description: 'Add React.memo to prevent unnecessary re-renders',
            severity: 'medium',
            code: 'export default React.memo(Component);'
          }
        ]);
      }, 1000);
      
    } catch (error: any) {
      toast({
        title: "Analysis Error",
        description: error.message || 'Failed to analyze component',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Clear the current response
   */
  const clearResponse = useCallback(() => {
    setResponse(null);
    setSuggestions([]);
    setTokens(0);
    setError('');
  }, []);

  return {
    isLoading,
    isAnalyzing,
    isFixing,
    error,
    tokens,
    response,
    question,
    suggestions,
    currentComponent,
    data,
    lastUpdated,
    setQuestion,
    submitQuestion,
    applyFix,
    applyAutoFix,
    clearResponse,
    analyze
  };
}

export default useAssistant;
