
import { renderHook, act } from '@testing-library/react';
import { useAssistantState } from '../useCodeAssistant';

// Mock state for testing
const initialState = {
  isLoading: false,
  conversation: [],
  error: null
};

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
    
    expect(result.current.state).toEqual(initialState);
  });

  it('should update loading state', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.state.isLoading).toBe(true);
  });

  it('should add a message to the conversation', () => {
    const { result } = renderHook(() => useAssistantState());
    const message = { role: 'user', content: 'Hello', timestamp: new Date() };
    
    act(() => {
      result.current.addMessage(message);
    });
    
    expect(result.current.state.conversation).toContain(message);
  });

  it('should add an AI response to the conversation', () => {
    const { result } = renderHook(() => useAssistantState());
    
    act(() => {
      result.current.setAIResponse({
        content: 'Hello from AI',
        metadata: { processingTime: 500 }
      });
    });
    
    expect(result.current.state.conversation[0]).toMatchObject({
      role: 'assistant',
      content: 'Hello from AI'
    });
  });

  it('should clear the conversation', () => {
    const { result } = renderHook(() => useAssistantState());
    const message = { role: 'user', content: 'Hello', timestamp: new Date() };
    
    act(() => {
      result.current.addMessage(message);
      result.current.clearConversation();
    });
    
    expect(result.current.state.conversation).toHaveLength(0);
  });

  it('should set an error', () => {
    const { result } = renderHook(() => useAssistantState());
    const error = new Error('Test error');
    
    act(() => {
      result.current.setError(error);
    });
    
    expect(result.current.state.error).toBe(error);
  });
});
