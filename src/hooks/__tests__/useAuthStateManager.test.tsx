
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthStateManager } from '@/hooks/useAuthStateManager';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserStreak } from '@/hooks/useUserStreak';
import { useLogout } from '@/hooks/useLogout';
import { toast } from '@/components/ui/use-toast';

// Mock all dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/hooks/useUserProfile');
jest.mock('@/hooks/useUserStreak');
jest.mock('@/hooks/useLogout');
jest.mock('@/components/ui/use-toast');
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

describe('useAuthStateManager Hook', () => {
  // Setup default mock return values
  const mockAuth = {
    user: { id: 'user-123', email: 'test@example.com' },
    isLoading: false
  };
  
  const mockUserProfile = {
    userProfile: { 
      username: 'TestUser', 
      astral_level: 5, 
      energy_points: 250 
    },
    todayChallenge: { id: 'challenge-123', title: 'Test Challenge' },
    isLoading: false,
    updateUserProfile: jest.fn()
  };
  
  const mockUserStreak = {
    userStreak: { current: 5, longest: 10 },
    activatedChakras: [0, 1, 2],
    updateStreak: jest.fn(),
    updateActivatedChakras: jest.fn()
  };
  
  const mockLogout = {
    handleLogout: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    (useAuth as jest.Mock).mockReturnValue(mockAuth);
    (useUserProfile as jest.Mock).mockReturnValue(mockUserProfile);
    (useUserStreak as jest.Mock).mockReturnValue(mockUserStreak);
    (useLogout as jest.Mock).mockReturnValue(mockLogout);
    (toast as jest.Mock).mockReturnValue({});
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: jest.fn() }
    });
  });

  it('should return correct initial state when all data is available', () => {
    const { result } = renderHook(() => useAuthStateManager());
    
    expect(result.current.user).toBe(mockAuth.user);
    expect(result.current.userProfile).toBe(mockUserProfile.userProfile);
    expect(result.current.todayChallenge).toBe(mockUserProfile.todayChallenge);
    expect(result.current.userStreak).toBe(mockUserStreak.userStreak);
    expect(result.current.activatedChakras).toBe(mockUserStreak.activatedChakras);
    expect(result.current.isLoading).toBe(mockAuth.isLoading);
    expect(result.current.profileLoading).toBe(mockUserProfile.isLoading);
    expect(result.current.handleLogout).toBe(mockLogout.handleLogout);
    expect(result.current.updateStreak).toBe(mockUserStreak.updateStreak);
    expect(result.current.updateActivatedChakras).toBe(mockUserStreak.updateActivatedChakras);
    expect(result.current.updateUserProfile).toBe(mockUserProfile.updateUserProfile);
    expect(result.current.hasCompletedLoading).toBe(true);
    expect(result.current.loadAttempts).toBe(0);
  });

  it('should handle null user profile and create fallback profile', () => {
    // Mock null user profile
    (useUserProfile as jest.Mock).mockReturnValue({
      ...mockUserProfile,
      userProfile: null
    });
    
    const { result } = renderHook(() => useAuthStateManager());
    
    expect(result.current.userProfile).toEqual({
      username: 'test',
      astral_level: 1,
      energy_points: 0
    });
  });

  it('should handle null user streak and create fallback streak', () => {
    // Mock null user streak
    (useUserStreak as jest.Mock).mockReturnValue({
      ...mockUserStreak,
      userStreak: null,
      activatedChakras: null
    });
    
    const { result } = renderHook(() => useAuthStateManager());
    
    expect(result.current.userStreak).toEqual({ current: 0, longest: 0 });
    expect(result.current.activatedChakras).toEqual([]);
  });

  it('should attempt to reload when user exists but profile is missing', async () => {
    jest.useFakeTimers();
    
    // Mock user but no profile
    (useUserProfile as jest.Mock).mockReturnValue({
      ...mockUserProfile,
      userProfile: null,
      isLoading: false
    });
    
    const { result } = renderHook(() => useAuthStateManager());
    
    // Wait for useEffect to run
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Loading profile data",
        description: "Retrying to load your profile..."
      })
    );
    
    expect(window.location.reload).toHaveBeenCalled();
    expect(result.current.loadAttempts).toBe(1);
    
    jest.useRealTimers();
  });

  it('should not reload more than 3 times', async () => {
    jest.useFakeTimers();
    
    // Mock user but no profile
    (useUserProfile as jest.Mock).mockReturnValue({
      ...mockUserProfile,
      userProfile: null,
      isLoading: false
    });
    
    const { rerender } = renderHook(() => useAuthStateManager());
    
    // Manually set loadAttempts to 3 (MAX)
    act(() => {
      // This is hacky but necessary for this test
      // We're directly manipulating the component's state
      const anyResult = result as any;
      anyResult.current.loadAttempts = 3;
    });
    
    rerender();
    
    // Advance timers
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    
    // Should not reload again
    expect(window.location.reload).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });
});
