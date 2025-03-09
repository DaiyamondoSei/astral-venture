
import { useState, useCallback } from 'react';
import { AIResponse } from '@/services/ai/types';

export function useAssistantState() {
  const [question, setQuestion] = useState<string>('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [streamingResponse, setStreamingResponse] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{model: string; tokens: number} | null>(null);
  
  const reset = useCallback(() => {
    setQuestion('');
    setResponse(null);
    setIsSubmitting(false);
    setHasError(false);
    setError(null);
    setLoading(false);
    setStreamingResponse(null);
    setModelInfo(null);
  }, []);
  
  return {
    question,
    setQuestion,
    response,
    setResponse,
    isSubmitting,
    setIsSubmitting,
    hasError,
    setHasError,
    error,
    setError,
    loading,
    setLoading,
    streamingResponse,
    setStreamingResponse,
    modelInfo,
    setModelInfo,
    reset
  };
}
