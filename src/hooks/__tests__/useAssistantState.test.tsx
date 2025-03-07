
import { renderHook, act } from '@testing-library/react';
import { useAssistantState } from '@/components/ai-assistant/hooks/useAssistantState';

// Mock for the AIResponse type
interface AIResponse {
  answer: string;
  source: string;
  meta: {
    model: string;
    tokenUsage: number;
  };
}

describe('useAssistantState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAssistantState());
    
    expect(result.current.loading).toBe(false);
    expect(result.current.response).toBeNull();
    expect(result.current.error).toBeNull();
    expect(typeof result.current.setLoading).toBe('function');
    expect(typeof result.current.setResponse).toBe('function');
    expect(typeof result.current.setError).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });
  
  it('should update loading state', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.loading).toBe(true);
    
    act(() => {
      result.current.setLoading(false);
    });
    
    expect(result.current.loading).toBe(false);
  });
  
  it('should update response state', () => {
    const { result } = renderHook(() => useAssistantState());
    
    const mockResponse: AIResponse = {
      answer: 'This is a test response',
      source: 'test-source',
      meta: {
        model: 'test-model',
        tokenUsage: 100
      }
    };
    
    act(() => {
      result.current.setResponse(mockResponse);
    });
    
    expect(result.current.response).toEqual(mockResponse);
  });
  
  it('should update error state', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setError('Test error message');
    });
    
    expect(result.current.error).toBe('Test error message');
  });
  
  it('should reset all state values', () => {
    const { result } = renderHook(() => useAssistantState());
    
    // Set some initial values
    act(() => {
      result.current.setLoading(true);
      result.current.setResponse({
        answer: 'Test response',
        source: 'test-source',
        meta: {
          model: 'test-model',
          tokenUsage: 100
        }
      });
      result.current.setError('Test error');
    });
    
    // Reset all values
    act(() => {
      result.current.reset();
    });
    
    // Check that values are reset to defaults
    expect(result.current.loading).toBe(false);
    expect(result.current.response).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
