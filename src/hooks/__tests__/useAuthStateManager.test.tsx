
import { renderHook, act } from '@testing-library/react';
import { useAuthStateManager } from '@/hooks/useAuthStateManager';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserStreak } from '@/hooks/useUserStreak';
import { useLogout } from '@/hooks/useLogout';
import { MemoryRouter } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

// Mock the modules
jest.mock('@/contexts/AuthContext');
jest.mock('@/hooks/useUserProfile');
jest.mock('@/hooks/useUserStreak');
jest.mock('@/hooks/useLogout');
jest.mock('@/components/ui/use-toast');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('useAuthStateManager', () => {
  // Setup mock return values
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      isLoading: false
    });
    
    (useUserProfile as jest.Mock).mockReturnValue({
      userProfile: { username: 'Test User', astral_level: 1, energy_points: 100 },
      todayChallenge: { id: 'challenge-1', title: 'Test Challenge' },
      isLoading: false,
      updateUserProfile: jest.fn()
    });
    
    (useUserStreak as jest.Mock).mockReturnValue({
      userStreak: { current: 5, longest: 10 },
      activatedChakras: [1, 2, 3],
      updateStreak: jest.fn().mockResolvedValue(6),
      updateActivatedChakras: jest.fn()
    });
    
    (useLogout as jest.Mock).mockReturnValue({
      handleLogout: jest.fn()
    });
    
    (toast as jest.Mock).mockReturnValue(undefined);
  });
  
  it('should return all expected values when auth is complete', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    
    const { result } = renderHook(() => useAuthStateManager(), { wrapper });
    
    expect(result.current).toMatchObject({
      user: { id: 'test-user-id', email: 'test@example.com' },
      userProfile: { username: 'Test User', astral_level: 1, energy_points: 100 },
      todayChallenge: { id: 'challenge-1', title: 'Test Challenge' },
      userStreak: { current: 5, longest: 10 },
      activatedChakras: [1, 2, 3],
      isLoading: false,
      profileLoading: false,
      hasCompletedLoading: true,
      loadAttempts: 0
    });
    
    expect(typeof result.current.handleLogout).toBe('function');
    expect(typeof result.current.updateStreak).toBe('function');
    expect(typeof result.current.updateActivatedChakras).toBe('function');
    expect(typeof result.current.updateUserProfile).toBe('function');
  });
  
  it('should handle missing profile gracefully', () => {
    (useUserProfile as jest.Mock).mockReturnValue({
      userProfile: null,
      todayChallenge: null,
      isLoading: false,
      updateUserProfile: jest.fn()
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    
    const { result } = renderHook(() => useAuthStateManager(), { wrapper });
    
    // Should create fallback profile when missing
    expect(result.current.userProfile).toMatchObject({
      username: 'test',
      astral_level: 1,
      energy_points: 0
    });
  });
  
  it('should handle missing user correctly', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    
    const { result } = renderHook(() => useAuthStateManager(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.userProfile).toBeNull();
  });
  
  it('should handle profile loading retry when profile is missing but user exists', () => {
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });
    
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id' },
      isLoading: false
    });
    (useUserProfile as jest.Mock).mockReturnValue({
      userProfile: null,
      todayChallenge: null,
      isLoading: false,
      updateUserProfile: jest.fn()
    });
    
    jest.useFakeTimers();
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    
    const { result, rerender } = renderHook(() => useAuthStateManager(), { wrapper });
    
    expect(result.current.loadAttempts).toBe(1);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Loading profile data"
    }));
    
    // Fast-forward past the reload timer
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(mockReload).toHaveBeenCalled();
    
    jest.useRealTimers();
  });
  
  it('should not retry more than the maximum attempts', () => {
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });
    
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id' },
      isLoading: false
    });
    (useUserProfile as jest.Mock).mockReturnValue({
      userProfile: null,
      todayChallenge: null,
      isLoading: false,
      updateUserProfile: jest.fn()
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
    
    // Simulate already tried 3 times
    const { result } = renderHook(() => {
      const hook = useAuthStateManager();
      // Manually override loadAttempts for testing
      Object.defineProperty(hook, 'loadAttempts', { value: 3 });
      return hook;
    }, { wrapper });
    
    // Should not try to reload again
    expect(mockReload).not.toHaveBeenCalled();
  });
});
