
import { useState } from 'react';
import { AIResponse } from '@/components/ai-assistant/types';

export interface UseAssistantStateOptions {
  initialQuestion?: string;
  initialResponse?: AIResponse;
}

export const useAssistantState = (options: UseAssistantStateOptions = {}) => {
  const [question, setQuestion] = useState(options.initialQuestion || '');
  const [response, setResponse] = useState<AIResponse>(
    options.initialResponse || {
      answer: '',
      type: 'text',
      meta: {
        model: '',
        tokenUsage: 0,
        processingTime: 0
      }
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokens, setTokens] = useState(0);

  return {
    question,
    setQuestion,
    response,
    setResponse,
    isLoading,
    setIsLoading,
    error,
    setError,
    isStreaming,
    setIsStreaming,
    tokens,
    setTokens
  };
};

export default useAssistantState;
