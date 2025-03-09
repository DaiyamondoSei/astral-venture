
import { render, renderHook, act } from '@testing-library/react';
import { useAssistantState } from '@/components/ai-assistant/hooks/useAssistantState';

// Mock data for testing
describe('useAssistantState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAssistantState());
    
    expect(result.current.question).toBe('');
    expect(result.current.response).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.hasError).toBe(false);
  });

  it('should update question', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setQuestion('How do I meditate?');
    });
    
    expect(result.current.question).toBe('How do I meditate?');
  });

  it('should update response', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setResponse({ 
        answer: 'Meditation is a practice where an individual uses a technique to focus their mind on a particular object, thought, or activity.',
        type: 'text'
      });
    });
    
    expect(result.current.response?.answer).toBe(
      'Meditation is a practice where an individual uses a technique to focus their mind on a particular object, thought, or activity.'
    );
  });

  it('should handle submission state', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setIsSubmitting(true);
    });
    
    expect(result.current.isSubmitting).toBe(true);
    
    act(() => {
      result.current.setIsSubmitting(false);
    });
    
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle error state', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setResponse({ 
        answer: 'Failed to process your request. Please try again.',
        type: 'error'
      });
      result.current.setHasError(true);
    });
    
    expect(result.current.hasError).toBe(true);
    expect(result.current.response?.type).toBe('error');
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useAssistantState());
    
    // Set some state first
    act(() => {
      result.current.setQuestion('How do I meditate?');
      result.current.setResponse({ 
        answer: 'Meditation is a practice where an individual uses a technique to focus their mind on a particular object, thought, or activity.',
        type: 'text'
      });
      result.current.setIsSubmitting(true);
      result.current.setHasError(true);
    });
    
    // Then reset
    act(() => {
      result.current.reset();
    });
    
    // Verify reset state
    expect(result.current.question).toBe('');
    expect(result.current.response).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.hasError).toBe(false);
  });
});
