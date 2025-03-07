
import { renderHook, act } from '@testing-library/react';
import { useAssistantState } from '@/components/ai-assistant/hooks/useAssistantState';

describe('useAssistantState Hook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAssistantState());
    
    expect(result.current.question).toBe('');
    expect(result.current.response).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.streamingResponse).toBeNull();
    expect(result.current.modelInfo).toBeNull();
  });

  it('should update question state correctly', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setQuestion('What is the meaning of life?');
    });
    
    expect(result.current.question).toBe('What is the meaning of life?');
  });

  it('should update loading state correctly', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.loading).toBe(true);
  });

  it('should update error state correctly', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setError('Something went wrong');
    });
    
    expect(result.current.error).toBe('Something went wrong');
  });

  it('should update response state correctly', () => {
    const { result } = renderHook(() => useAssistantState());
    const mockResponse = { 
      text: 'This is a response',
      source: 'ai',
      meta: { model: 'test-model', tokenUsage: 42 }
    };
    
    act(() => {
      result.current.setResponse(mockResponse);
    });
    
    expect(result.current.response).toEqual(mockResponse);
  });

  it('should update streaming response state correctly', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setStreamingResponse('Partial response...');
    });
    
    expect(result.current.streamingResponse).toBe('Partial response...');
  });

  it('should update model info state correctly', () => {
    const { result } = renderHook(() => useAssistantState());
    const mockModelInfo = { model: 'gpt-4', tokens: 320 };
    
    act(() => {
      result.current.setModelInfo(mockModelInfo);
    });
    
    expect(result.current.modelInfo).toEqual(mockModelInfo);
  });

  it('should reset all states correctly', () => {
    const { result } = renderHook(() => useAssistantState());
    
    // First, set some values
    act(() => {
      result.current.setQuestion('Test question');
      result.current.setLoading(true);
      result.current.setError('Test error');
      result.current.setResponse({ text: 'Test response', source: 'ai' });
      result.current.setStreamingResponse('Test streaming');
      result.current.setModelInfo({ model: 'test-model', tokens: 123 });
    });
    
    // Then reset
    act(() => {
      result.current.reset();
    });
    
    // Verify all states are reset
    expect(result.current.question).toBe('');
    expect(result.current.response).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.streamingResponse).toBeNull();
    expect(result.current.modelInfo).toBeNull();
  });
});
