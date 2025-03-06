
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlowEffect from '@/components/GlowEffect';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserStreak } from '@/hooks/useUserStreak';
import { useLogout } from '@/hooks/useLogout';
import { toast } from '@/components/ui/use-toast';

interface AuthStateManagerProps {
  onLoadingComplete: (userData: {
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
  }) => void;
}

const AuthStateManager: React.FC<AuthStateManagerProps> = ({ onLoadingComplete }) => {
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
    // Only proceed if we haven't already completed loading and all data is ready
    if (!hasCompletedLoading && !isLoading && !profileLoading) {
      if (user && !userProfile && loadAttempts < 3) {
        // If profile is missing but we have a user, retry loading
        setLoadAttempts(prev => prev + 1);
        
        // Add a delay before retry
        toast({
          title: "Loading profile data",
          description: "Retrying to load your profile...",
          duration: 1500
        });
        
        // Use setTimeout to delay the reload
        const timer = setTimeout(() => {
          window.location.reload();
        }, 2000);
        
        return () => clearTimeout(timer);
      }
      
      // Mark as completed to prevent further calls
      setHasCompletedLoading(true);
      
      // Call the completion handler only once
      onLoadingComplete({
        user,
        userProfile: userProfile || {
          // Provide fallback profile if missing
          username: user?.email?.split('@')[0] || 'Seeker',
          astral_level: 1,
          energy_points: 0
        },
        todayChallenge,
        userStreak,
        activatedChakras,
        isLoading,
        profileLoading,
        handleLogout,
        updateStreak,
        updateActivatedChakras,
        updateUserProfile
      });
    }
  }, [
    isLoading, 
    profileLoading, 
    user, 
    userProfile, 
    todayChallenge, 
    userStreak, 
    activatedChakras, 
    loadAttempts, 
    handleLogout, 
    updateStreak, 
    updateActivatedChakras, 
    updateUserProfile, 
    onLoadingComplete,
    hasCompletedLoading
  ]);

  if (isLoading || profileLoading) {
    return (
      <Layout className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <GlowEffect 
            className="w-16 h-16 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-700 mx-auto mb-4"
            animation="pulse"
          />
          <p className="text-white/70 animate-pulse">
            {isLoading ? "Loading user data..." : "Loading your astral profile..."}
          </p>
        </div>
      </Layout>
    );
  }

  return null;
};

export default AuthStateManager;
