
import { renderHook, act } from '@testing-library/react';
import { useAstralDemo } from '@/hooks/useAstralDemo';

// Mock the useUserProfile hook
jest.mock('@/hooks/useUserProfile', () => ({
  useUserProfile: jest.fn(() => ({
    userProfile: { energy_points: 100 },
    updateUserProfile: jest.fn()
  }))
}));

describe('useAstralDemo Hook', () => {
  test('returns initial state correctly', () => {
    const { result } = renderHook(() => useAstralDemo());
    
    expect(result.current.energyPoints).toBe(100); // From mocked userProfile
    expect(result.current.simulatedPoints).toBe(0);
    expect(result.current.isSimulating).toBe(false);
    expect(result.current.incrementAmount).toBe(50);
  });

  test('toggles simulation mode', () => {
    const { result } = renderHook(() => useAstralDemo());
    
    act(() => {
      result.current.setIsSimulating(true);
    });
    
    expect(result.current.isSimulating).toBe(true);
    
    // When simulating, energyPoints should be simulatedPoints
    expect(result.current.energyPoints).toBe(0);
  });

  test('updates simulated points', () => {
    const { result } = renderHook(() => useAstralDemo());
    
    act(() => {
      result.current.setIsSimulating(true);
      result.current.setSimulatedPoints(500);
    });
    
    expect(result.current.simulatedPoints).toBe(500);
    expect(result.current.energyPoints).toBe(500); // energyPoints should reflect simulatedPoints
  });

  test('updates increment amount', () => {
    const { result } = renderHook(() => useAstralDemo());
    
    act(() => {
      result.current.setIncrementAmount(200);
    });
    
    expect(result.current.incrementAmount).toBe(200);
  });
});
