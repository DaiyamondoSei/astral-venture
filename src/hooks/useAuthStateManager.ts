
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserStreak } from '@/hooks/useUserStreak';
import { useLogout } from '@/hooks/useLogout';
import { toast } from '@/components/ui/use-toast';

interface AuthStateManagerResult {
  user: any;
  userProfile: any;
  todayChallenge: any;
  userStreak: any;
  activatedChakras: number[];
  isLoading: boolean;
  profileLoading: boolean;
  handleLogout: () => void;
  updateStreak: (newStreak: number) => Promise<number | undefined>;
  updateActivatedChakras: (newActivatedChakras: number[]) => void;
  updateUserProfile: (newData: any) => void;
  hasCompletedLoading: boolean;
  loadAttempts: number;
}

/**
 * Hook to manage auth state and related user data
 * Extracts complex loading logic from AuthStateManager component
 */
export function useAuthStateManager(): AuthStateManagerResult {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [hasCompletedLoading, setHasCompletedLoading] = useState(false);
  
  const { 
    userProfile, 
    todayChallenge, 
    isLoading: profileLoading, 
    updateUserProfile 
  } = useUserProfile();
  
  const { 
    userStreak, 
    activatedChakras, 
    updateStreak, 
    updateActivatedChakras 
  } = useUserStreak(user?.id);
  
  const { handleLogout } = useLogout(user?.id);

  // Log key state information for debugging
  useEffect(() => {
    console.log("AuthStateManager state:", {
      isLoading,
      profileLoading,
      user: user ? "exists" : "null",
      userProfile: userProfile ? "exists" : "null",
      userStreak,
      activatedChakras,
      loadAttempts,
      hasCompletedLoading
    });
  }, [isLoading, profileLoading, user, userProfile, userStreak, activatedChakras, loadAttempts, hasCompletedLoading]);

  // Handle errors with loading state - fix for infinite loop
  useEffect(() => {
    // Only proceed if we haven't already completed loading
    if (hasCompletedLoading) return;
    
    // Wait until both auth and profile loading are complete
    if (isLoading || profileLoading) return;
    
    // Set completed loading flag to prevent multiple updates
    setHasCompletedLoading(true);
    
    // If we have a user but no profile, and we haven't retried too many times
    if (user && !userProfile && loadAttempts < 3) {
      setLoadAttempts(prev => prev + 1);
      
      toast({
        title: "Loading profile data",
        description: "Retrying to load your profile...",
        duration: 1500
      });
      
      // Use setTimeout to delay the reload but don't set state again in this effect
      const timer = setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [
    isLoading, 
    profileLoading, 
    user, 
    userProfile, 
    loadAttempts, 
    hasCompletedLoading
  ]);

  // Create safe versions of potentially undefined values
  const safeUserStreak = userStreak || { current: 0, longest: 0 };
  const safeActivatedChakras = activatedChakras || [];
  
  // Create fallback profile if missing
  const safeUserProfile = userProfile || (user ? {
    username: user.email?.split('@')[0] || 'Seeker',
    astral_level: 1,
    energy_points: 0
  } : null);

  return {
    user,
    userProfile: safeUserProfile,
    todayChallenge,
    userStreak: safeUserStreak,
    activatedChakras: safeActivatedChakras,
    isLoading,
    profileLoading,
    handleLogout,
    updateStreak,
    updateActivatedChakras,
    updateUserProfile,
    hasCompletedLoading,
    loadAttempts
  };
}
