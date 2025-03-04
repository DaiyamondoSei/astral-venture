
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import EntryAnimation from '@/components/EntryAnimation';
import AuthForms from '@/components/AuthForms';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import GlowEffect from '@/components/GlowEffect';
import { useToast } from '@/components/ui/use-toast';
import UserWelcome from '@/components/UserWelcome';
import UserDashboardCards from '@/components/UserDashboardCards';
import WelcomeMessage from '@/components/WelcomeMessage';
import MainContent from '@/components/MainContent';
import { useUserProfile } from '@/hooks/useUserProfile';

const Index = () => {
  const [showEntryAnimation, setShowEntryAnimation] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, todayChallenge, isLoading: profileLoading, updateUserProfile } = useUserProfile();

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedQuanex');
    if (!hasVisited && user) {
      setShowEntryAnimation(true);
      localStorage.setItem('hasVisitedQuanex', 'true');
    } else {
      setFirstLoad(false);
    }
  }, [user]);

  const handleLogout = async () => {
    if (user) {
      try {
        await supabase.auth.signOut();
        toast({
          title: "Signed out",
          description: "You've been successfully signed out.",
        });
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

  const handleEntryAnimationComplete = () => {
    setShowEntryAnimation(false);
    setFirstLoad(false);
  };

  const handleChallengeComplete = async (pointsEarned: number) => {
    if (!userProfile) return;
    
    updateUserProfile({
      energy_points: userProfile.energy_points + pointsEarned
    });
    
    toast({
      title: "Energy Points Increased!",
      description: `+${pointsEarned} points added to your profile`,
    });
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

  return (
    <Layout>
      {showEntryAnimation && (
        <EntryAnimation onComplete={handleEntryAnimationComplete} />
      )}
      
      {!showEntryAnimation && (
        <>
          {!user ? (
            <>
              <WelcomeMessage />
              <AuthForms className="mt-8" />
            </>
          ) : (
            <>
              <UserWelcome 
                username={userProfile?.username || user.email?.split('@')[0] || 'Seeker'} 
                onLogout={handleLogout}
                astralLevel={userProfile?.astral_level || 1}
              />
              <UserDashboardCards 
                energyPoints={userProfile?.energy_points || 0}
                astralLevel={userProfile?.astral_level || 1}
                todayChallenge={todayChallenge}
              />
              <MainContent 
                userProfile={userProfile}
                onChallengeComplete={handleChallengeComplete}
              />
            </>
          )}
        </>
      )}
    </Layout>
  );
};

export default Index;
