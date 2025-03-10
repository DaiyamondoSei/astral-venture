
import { useCallback } from 'react';
import { useAuth } from './useAuth';
import type { IUserProfile, IUserStreak } from '@/contexts/AuthContext';

/**
 * Hook for accessing authentication state and actions
 * 
 * This provides a simpler interface to the auth context when
 * you only need the basic authentication state and actions.
 */
export function useAuthState() {
  const auth = useAuth();

  const handleLogin = useCallback(async (email: string, password: string) => {
    return auth.login(email, password);
  }, [auth]);

  const handleLogout = useCallback(async () => {
    return auth.logout();
  }, [auth]);

  const handleRegister = useCallback(async (email: string, password: string) => {
    return auth.register(email, password);
  }, [auth]);

  const updateUserProfile = useCallback((profile: Partial<IUserProfile>) => {
    auth.updateUserProfile(profile);
  }, [auth]);

  const updateStreak = useCallback((streak: IUserStreak) => {
    auth.updateStreak(streak);
  }, [auth]);

  const updateActivatedChakras = useCallback((chakras: number[]) => {
    auth.updateActivatedChakras(chakras);
  }, [auth]);

  return {
    user: auth.user,
    userProfile: auth.userProfile,
    userStreak: auth.userStreak,
    activatedChakras: auth.activatedChakras,
    todayChallenge: auth.todayChallenge,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    hasCompletedLoading: auth.hasCompletedLoading,
    profileLoading: auth.profileLoading,
    isLoggingOut: auth.isLoggingOut,
    errorMessage: auth.errorMessage,
    
    // Auth actions
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    handleLogout: handleLogout,
    
    // Profile actions
    updateUserProfile,
    updateStreak,
    updateActivatedChakras
  };
}

export default useAuthState;
