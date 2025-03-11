
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserStreak } from '@/hooks/useUserStreak';
import { useLogout } from '@/hooks/auth/useLogout';
import { toast } from '@/components/ui/use-toast';

/**
 * Custom hook for managing authentication state
 * Combines data from auth context, user profile, and streak in one place
 */
export function useAuthStateManager() {
  const auth = useAuth();
  const { userProfile, todayChallenge, isLoading: profileLoading, updateUserProfile } = useUserProfile();
  const { userStreak, activatedChakras, updateStreak, updateActivatedChakras } = useUserStreak();
  const { handleLogout } = useLogout();
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [hasCompletedLoading, setHasCompletedLoading] = useState(false);

  // Try to reload if profile data isn't loading but user exists and profile is null
  useEffect(() => {
    if (auth.user && !auth.isLoading && !profileLoading && !userProfile && loadAttempts < 3) {
      toast({
        title: "Loading profile data",
        description: "Retrieving your data..."
      });
      
      // Increment attempts and try reloading
      setLoadAttempts(loadAttempts + 1);
      
      // Wait and reload the page to try again
      const timer = setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    // Profile loading is complete when all data is loaded or all attempts are exhausted
    if (!auth.isLoading && !profileLoading) {
      setHasCompletedLoading(true);
    }
  }, [auth.user, auth.isLoading, profileLoading, userProfile, loadAttempts]);

  return {
    user: auth.user,
    userProfile,
    todayChallenge,
    userStreak,
    activatedChakras,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    profileLoading,
    hasCompletedLoading,
    handleLogout,
    login: auth.login,
    logout: auth.logout,
    register: auth.register,
    isLoggingOut: auth.isLoggingOut,
    updateStreak,
    updateActivatedChakras,
    updateUserProfile,
    loadAttempts
  };
}

export default useAuthStateManager;
