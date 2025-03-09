
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AIQueryOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  useCache?: boolean;
}

export interface AIQueryResult {
  answer: string;
  insights?: any[];
  metrics?: {
    processingTime: number;
    tokenUsage?: number;
    model?: string;
  }
}

export function useAIAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIQueryResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const askQuestion = useCallback(async (
    question: string, 
    context?: string, 
    reflectionId?: string,
    options?: AIQueryOptions
  ) => {
    if (!question.trim()) {
      setError("Question cannot be empty");
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke<AIQueryResult>(
        'process-ai-query',
        {
          body: {
            query: question,
            context,
            userId: user?.id,
            reflectionId,
            options: {
              model: options?.model || "gpt-4o-mini",
              temperature: options?.temperature || 0.7,
              maxTokens: options?.maxTokens || 1000,
              stream: options?.stream || false,
              useCache: options?.useCache !== false,
            }
          }
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error("No data received from AI service");
      }

      setResult(data);
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to get AI response";
      setError(errorMessage);
      
      toast({
        title: "AI Assistant Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  return {
    askQuestion,
    isLoading,
    error,
    result,
  };
}

export default useAIAssistant;
