
import { renderHook, act } from '@testing-library/react';
import { useProgressTracking } from '../../achievement/useProgressTracking';
import { AchievementState } from '../../achievement/types';

describe('useProgressTracking Hook', () => {
  // Define mock state and setter for testing
  const mockSetProgressTracking = jest.fn();
  
  // Create a valid mock state that matches the AchievementState interface
  const mockState: AchievementState = {
    earnedAchievements: [],
    unlockedAchievements: [],
    progress: {},
    recentAchievements: [],
    hasNewAchievements: false,
    totalPoints: 0,
    achievementHistory: {},
    currentAchievement: null,
    progressTracking: {
      streakDays: 5,
      reflections: 10,
      meditation_minutes: 60,
    }
  };

  beforeEach(() => {
    mockSetProgressTracking.mockClear();
  });

  it('should initialize with the correct state', () => {
    const { result } = renderHook(() => 
      useProgressTracking(mockState, mockSetProgressTracking)
    );
    
    expect(result.current.getProgressValue('streakDays')).toBe(5);
    expect(result.current.getProgressValue('reflections')).toBe(10);
    expect(result.current.getProgressValue('meditation_minutes')).toBe(60);
    expect(result.current.getProgressValue('nonexistent')).toBe(0);
  });

  it('should track progress correctly', () => {
    const { result } = renderHook(() => 
      useProgressTracking(mockState, mockSetProgressTracking)
    );
    
    act(() => {
      result.current.trackProgress('reflections', 1);
    });
    
    expect(mockSetProgressTracking).toHaveBeenCalledWith({
      ...mockState.progressTracking,
      reflections: 11
    });
  });

  it('should initialize a new tracking type if it doesn\'t exist', () => {
    const { result } = renderHook(() => 
      useProgressTracking(mockState, mockSetProgressTracking)
    );
    
    act(() => {
      result.current.trackProgress('wisdom_resources', 3);
    });
    
    expect(mockSetProgressTracking).toHaveBeenCalledWith({
      ...mockState.progressTracking,
      wisdom_resources: 3
    });
  });

  it('should log activity with default value correctly', () => {
    const { result } = renderHook(() => 
      useProgressTracking(mockState, mockSetProgressTracking)
    );
    
    act(() => {
      result.current.logActivity('reflections');
    });
    
    expect(mockSetProgressTracking).toHaveBeenCalledWith({
      ...mockState.progressTracking,
      reflections: 11
    });
  });

  it('should log activity with details.value correctly', () => {
    const { result } = renderHook(() => 
      useProgressTracking(mockState, mockSetProgressTracking)
    );
    
    act(() => {
      result.current.logActivity('meditation_minutes', { value: 15 });
    });
    
    expect(mockSetProgressTracking).toHaveBeenCalledWith({
      ...mockState.progressTracking,
      meditation_minutes: 75
    });
  });

  it('should log activity with details.amount correctly', () => {
    const { result } = renderHook(() => 
      useProgressTracking(mockState, mockSetProgressTracking)
    );
    
    act(() => {
      result.current.logActivity('meditation_minutes', { amount: 10 });
    });
    
    expect(mockSetProgressTracking).toHaveBeenCalledWith({
      ...mockState.progressTracking,
      meditation_minutes: 70
    });
  });

  it('should handle negative progress values correctly', () => {
    const { result } = renderHook(() => 
      useProgressTracking(mockState, mockSetProgressTracking)
    );
    
    act(() => {
      result.current.trackProgress('reflections', -5);
    });
    
    expect(mockSetProgressTracking).toHaveBeenCalledWith({
      ...mockState.progressTracking,
      reflections: 5
    });
  });

  it('should prevent progress from going below zero', () => {
    const { result } = renderHook(() => 
      useProgressTracking(mockState, mockSetProgressTracking)
    );
    
    act(() => {
      result.current.trackProgress('reflections', -20); // Would make it negative
    });
    
    expect(mockSetProgressTracking).toHaveBeenCalledWith({
      ...mockState.progressTracking,
      reflections: 0
    });
  });

  it('should increment multiple tracking types in one call', () => {
    const { result } = renderHook(() => 
      useProgressTracking(mockState, mockSetProgressTracking)
    );
    
    act(() => {
      result.current.trackMultipleProgress({
        reflections: 2,
        meditation_minutes: 15,
        wisdom_resources: 1
      });
    });
    
    expect(mockSetProgressTracking).toHaveBeenCalledWith({
      ...mockState.progressTracking,
      reflections: 12,
      meditation_minutes: 75,
      wisdom_resources: 1
    });
  });

  // New test cases below
  it('should handle zero progress changes correctly', () => {
    const { result } = renderHook(() => 
      useProgressTracking(mockState, mockSetProgressTracking)
    );
    
    act(() => {
      result.current.trackProgress('reflections', 0);
    });
    
    expect(mockSetProgressTracking).toHaveBeenCalledWith({
      ...mockState.progressTracking,
      reflections: 10 // Should remain unchanged
    });
  });

  it('should handle decimal progress values correctly', () => {
    const { result } = renderHook(() => 
      useProgressTracking(mockState, mockSetProgressTracking)
    );
    
    act(() => {
      result.current.trackProgress('meditation_minutes', 1.5);
    });
    
    expect(mockSetProgressTracking).toHaveBeenCalledWith({
      ...mockState.progressTracking,
      meditation_minutes: 61.5
    });
  });

  it('should reset a specific progress type correctly', () => {
    const { result } = renderHook(() => 
      useProgressTracking(mockState, mockSetProgressTracking)
    );
    
    act(() => {
      result.current.resetProgress('reflections');
    });
    
    expect(mockSetProgressTracking).toHaveBeenCalledWith({
      ...mockState.progressTracking,
      reflections: 0
    });
  });
});
