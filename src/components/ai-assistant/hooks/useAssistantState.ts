
import { useState, useCallback } from 'react';
import { AIResponse } from '@/services/ai/types';

export function useAssistantState() {
  const [question, setQuestion] = useState<string>('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingResponse, setStreamingResponse] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{model: string; tokens: number} | null>(null);
  
  const reset = useCallback(() => {
    setQuestion('');
    setResponse(null);
    setError(null);
    setStreamingResponse(null);
    setModelInfo(null);
    setLoading(false);
  }, []);
  
  return {
    question,
    setQuestion,
    response,
    setResponse,
    loading,
    setLoading,
    error,
    setError,
    streamingResponse,
    setStreamingResponse,
    modelInfo,
    setModelInfo,
    reset
  };
}
