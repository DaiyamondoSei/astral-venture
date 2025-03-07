
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
    
    expect(result.current.isOpen).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.assistantResponse).toBeNull();
    expect(result.current.errorMessage).toBeNull();
    expect(typeof result.current.setIsOpen).toBe('function');
    expect(typeof result.current.setLoading).toBe('function');
    expect(typeof result.current.setAssistantResponse).toBe('function');
    expect(typeof result.current.setErrorMessage).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });
  
  it('should update isOpen state', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setIsOpen(true);
    });
    
    expect(result.current.isOpen).toBe(true);
    
    act(() => {
      result.current.setIsOpen(false);
    });
    
    expect(result.current.isOpen).toBe(false);
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
  
  it('should update assistantResponse state', () => {
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
      result.current.setAssistantResponse(mockResponse);
    });
    
    expect(result.current.assistantResponse).toEqual(mockResponse);
  });
  
  it('should update errorMessage state', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setErrorMessage('Test error message');
    });
    
    expect(result.current.errorMessage).toBe('Test error message');
  });
  
  it('should reset all state values', () => {
    const { result } = renderHook(() => useAssistantState());
    
    // Set some initial values
    act(() => {
      result.current.setIsOpen(true);
      result.current.setLoading(true);
      result.current.setAssistantResponse({
        answer: 'Test response',
        source: 'test-source',
        meta: {
          model: 'test-model',
          tokenUsage: 100
        }
      });
      result.current.setErrorMessage('Test error');
    });
    
    // Reset all values
    act(() => {
      result.current.reset();
    });
    
    // Check that values are reset to defaults
    expect(result.current.isOpen).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.assistantResponse).toBeNull();
    expect(result.current.errorMessage).toBeNull();
  });
});
