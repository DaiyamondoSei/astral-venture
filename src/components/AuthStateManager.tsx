
import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlowEffect from '@/components/GlowEffect';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserStreak } from '@/hooks/useUserStreak';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, todayChallenge, isLoading: profileLoading, updateUserProfile } = useUserProfile();
  const { userStreak, activatedChakras, updateStreak, updateActivatedChakras } = useUserStreak(user?.id);

  React.useEffect(() => {
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
  }, [isLoading, profileLoading, user, userProfile, todayChallenge, userStreak, activatedChakras]);

  const handleLogout = async () => {
    if (user) {
      try {
        await supabase.auth.signOut();
        toast({
          title: "Signed out",
          description: "You've been successfully signed out.",
        });
        localStorage.removeItem(`entry-animation-shown-${user.id}`);
      } catch (error: any) {
        console.error('Error signing out:', error);
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

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
