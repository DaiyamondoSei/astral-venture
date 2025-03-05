
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlowEffect from '@/components/GlowEffect';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserStreak } from '@/hooks/useUserStreak';
import { useLogout } from '@/hooks/useLogout';

interface AuthStateManagerProps {
  onLoadingComplete: (userData: {
    user: any;
    userProfile: any;
    todayChallenge: any;
    userStreak: any;
    activatedChakras: number[];
    isLoading: boolean;
    profileLoading: boolean;
  }) => void;
}

const AuthStateManager: React.FC<AuthStateManagerProps> = ({ onLoadingComplete }) => {
  const { user, isLoading } = useAuth();
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

  useEffect(() => {
    if (!isLoading && !profileLoading) {
      onLoadingComplete({
        user,
        userProfile,
        todayChallenge,
        userStreak,
        activatedChakras,
        isLoading,
        profileLoading
      });
    }
  }, [isLoading, profileLoading, user, userProfile, todayChallenge, userStreak, activatedChakras, onLoadingComplete]);

  if (isLoading || profileLoading) {
    return (
      <Layout className="flex min-h-screen items-center justify-center">
        <GlowEffect 
          className="w-16 h-16 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-700"
          animation="pulse"
        />
      </Layout>
    );
  }

  return null;
};

export default AuthStateManager;
