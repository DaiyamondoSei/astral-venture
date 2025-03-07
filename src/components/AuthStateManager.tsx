
import React, { useEffect } from 'react';
import GlowEffect from '@/components/GlowEffect';
import Layout from '@/components/Layout';
import { useAuthStateManager } from '@/hooks/useAuthStateManager';

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

/**
 * Component to manage authentication state and provide user data to parent components
 * Uses useAuthStateManager hook to handle the complex loading logic
 */
const AuthStateManager: React.FC<AuthStateManagerProps> = ({ onLoadingComplete }) => {
  // Use the extracted hook to manage auth state
  const authState = useAuthStateManager();
  
  // Call the completion handler when loading is complete
  useEffect(() => {
    if (authState.hasCompletedLoading) {
      onLoadingComplete({
        user: authState.user,
        userProfile: authState.userProfile,
        todayChallenge: authState.todayChallenge,
        userStreak: authState.userStreak,
        activatedChakras: authState.activatedChakras,
        isLoading: authState.isLoading,
        profileLoading: authState.profileLoading,
        handleLogout: authState.handleLogout,
        updateStreak: authState.updateStreak,
        updateActivatedChakras: authState.updateActivatedChakras,
        updateUserProfile: authState.updateUserProfile
      });
    }
  }, [authState, onLoadingComplete]);

  // Show loading state while data is being fetched
  if (authState.isLoading || authState.profileLoading) {
    return (
      <Layout className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <GlowEffect 
            className="w-16 h-16 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-700 mx-auto mb-4"
            animation="pulse"
          />
          <p className="text-white/70 animate-pulse">
            {authState.isLoading ? "Loading user data..." : "Loading your astral profile..."}
          </p>
        </div>
      </Layout>
    );
  }

  return null;
};

export default AuthStateManager;
