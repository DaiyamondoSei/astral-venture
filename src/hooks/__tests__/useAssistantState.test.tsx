
import { renderHook, act } from '@testing-library/react';
import { useAssistantState } from '@/components/ai-assistant/hooks/useAssistantState';

// Mock the API response
jest.mock('../../utils/ai/AICodeAssistant', () => ({
  aiCodeAssistant: {
    registerIntent: jest.fn((description, relatedComponents) => 'mock-intent-id'),
    updateIntentStatus: jest.fn(() => true),
    getIntents: jest.fn(() => []),
    generateSuggestions: jest.fn(() => [])
  }
}));

describe('useAssistantState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAssistantState());
    
    expect(result.current.question).toBe('');
    expect(result.current.response).toEqual({ content: '', metadata: {} });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.conversation).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('should update loading state', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
  });

  it('should add a message to the conversation', () => {
    const { result } = renderHook(() => useAssistantState());
    const message = { role: 'user', content: 'Hello', timestamp: new Date() };
    
    act(() => {
      result.current.addToConversation(message);
    });
    
    expect(result.current.conversation).toContain(message);
  });

  it('should add an AI response to the conversation', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setResponse({
        content: 'Hello from AI',
        metadata: { processingTime: 500 }
      });
    });
    
    // Check if response is set properly
    expect(result.current.response.content).toBe('Hello from AI');
  });

  it('should clear the conversation', () => {
    const { result } = renderHook(() => useAssistantState());
    const message = { role: 'user', content: 'Hello', timestamp: new Date() };
    
    act(() => {
      result.current.addToConversation(message);
      result.current.reset();
    });
    
    expect(result.current.conversation).toHaveLength(0);
  });

  it('should set an error', () => {
    const { result } = renderHook(() => useAssistantState());
    const error = 'Test error';
    
    act(() => {
      result.current.setError(error);
    });
    
    expect(result.current.error).toBe(error);
  });
});
