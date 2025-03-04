
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import OrbToAstralTransition from '@/components/OrbToAstralTransition';

const Index = () => {
  const [showEntryAnimation, setShowEntryAnimation] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, todayChallenge, isLoading: profileLoading, updateUserProfile } = useUserProfile();
  const { userStreak, activatedChakras, updateStreak, updateActivatedChakras } = useUserStreak(user?.id);

  useEffect(() => {
    // Check if user just logged in and hasn't seen the entry animation yet
    if (user && !localStorage.getItem(`entry-animation-shown-${user.id}`)) {
      setShowEntryAnimation(true);
    }
  }, [user]);

  const handleEntryAnimationComplete = () => {
    setAnimationCompleted(true);
    if (user) {
      localStorage.setItem(`entry-animation-shown-${user.id}`, 'true');
    }

    // Wait a bit before showing the main dashboard
    setTimeout(() => {
      setShowEntryAnimation(false);
    }, 1000);
  };

  const handleLogout = async () => {
    if (user) {
      try {
        await supabase.auth.signOut();
        toast({
          title: "Signed out",
          description: "You've been successfully signed out.",
        });
        // Clear local storage entry animation flag
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
      {showEntryAnimation ? (
        <div className="h-screen flex flex-col items-center justify-center">
          <OrbToAstralTransition onComplete={handleEntryAnimationComplete} />
          {animationCompleted && (
            <div className="text-center mt-8 animate-fade-in">
              <p className="text-white/80 mb-4">
                Your astral field is now calibrated to your energy frequency.
              </p>
              <button 
                onClick={() => setShowEntryAnimation(false)}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-quantum-500 to-astral-500 text-white"
              >
                Continue to Your Practice
              </button>
            </div>
          )}
        </div>
      ) : (!user ? (
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
