
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AuthForms from '@/components/AuthForms';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import GlowEffect from '@/components/GlowEffect';
import { useToast } from '@/components/ui/use-toast';
import WelcomeMessage from '@/components/WelcomeMessage';
import EntryAnimationManager from '@/components/EntryAnimationManager';
import UserDashboardView from '@/components/UserDashboardView';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserStreak } from '@/hooks/useUserStreak';
import { CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';

const Index = () => {
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const { userProfile, todayChallenge, isLoading: profileLoading, updateUserProfile } = useUserProfile();
  const { userStreak, activatedChakras, updateStreak, updateActivatedChakras } = useUserStreak(user?.id);

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
      <EntryAnimationManager 
        user={user}
        onComplete={() => setAnimationCompleted(true)}
      />
      
      {(!user ? (
        <>
          <WelcomeMessage />
          <AuthForms className="mt-8" />
        </>
      ) : (
        <UserDashboardView
          user={user}
          userProfile={userProfile}
          todayChallenge={todayChallenge}
          userStreak={userStreak}
          activatedChakras={activatedChakras}
          onLogout={handleLogout}
          updateStreak={updateStreak}
          updateActivatedChakras={updateActivatedChakras}
          updateUserProfile={updateUserProfile}
          onChallengeComplete={handleChallengeComplete}
        />
      ))}
    </Layout>
  );
};

export default Index;
