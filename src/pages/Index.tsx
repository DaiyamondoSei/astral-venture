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
import DevModePanel from '@/components/dev-mode/DevModePanel';
import DevModeToggle from '@/components/dev-mode/DevModeToggle';

const Index = () => {
  const [showEntryAnimation, setShowEntryAnimation] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, todayChallenge, isLoading: profileLoading, updateUserProfile } = useUserProfile();
  const { userStreak, activatedChakras, updateStreak, updateActivatedChakras } = useUserStreak(user?.id);
  
  const [isDeveloperMode, setIsDeveloperMode] = useState(() => {
    return localStorage.getItem('developerMode') === 'true';
  });
  const [showDevPanel, setShowDevPanel] = useState(false);

  useEffect(() => {
    if (user && !localStorage.getItem(`entry-animation-shown-${user.id}`)) {
      const dreamCaptureCompleted = localStorage.getItem('dreamCaptureCompleted');
      
      if (!dreamCaptureCompleted) {
        navigate('/dream-capture');
      } else {
        setShowEntryAnimation(true);
      }
    }
  }, [user, navigate]);

  const handleEntryAnimationComplete = () => {
    setAnimationCompleted(true);
    if (user) {
      localStorage.setItem(`entry-animation-shown-${user.id}`, 'true');
    }

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

  const handleChallengeComplete = async (pointsEarned: number, emotionalInsights?: any) => {
    if (!userProfile) return;
    
    updateUserProfile({
      energy_points: userProfile.energy_points + pointsEarned
    });
    
    if (emotionalInsights && emotionalInsights.chakrasActivated && emotionalInsights.chakrasActivated.length > 0) {
      const newChakras = [...activatedChakras];
      emotionalInsights.chakrasActivated.forEach((chakraIndex: number) => {
        if (!newChakras.includes(chakraIndex)) {
          newChakras.push(chakraIndex);
        }
      });
      
      updateActivatedChakras(newChakras);
      
      const newlyActivated = emotionalInsights.chakrasActivated.filter(
        (chakra: number) => !activatedChakras.includes(chakra)
      );
      
      let chakraMessage = '';
      if (newlyActivated.length > 0) {
        chakraMessage = ` Your ${CHAKRA_NAMES[newlyActivated[0]]} chakra energy is awakening.`;
      }
      
      toast({
        title: "Energy Points Increased!",
        description: `+${pointsEarned} points added to your profile.${chakraMessage}`,
      });
    } else {
      toast({
        title: "Energy Points Increased!",
        description: `+${pointsEarned} points added to your profile`,
      });
    }
  };

  const toggleDeveloperMode = () => {
    const newMode = !isDeveloperMode;
    setIsDeveloperMode(newMode);
    localStorage.setItem('developerMode', newMode.toString());
    
    toast({
      title: newMode ? "Developer Mode Enabled" : "Developer Mode Disabled",
      description: newMode ? "You can now access advanced testing features" : "Developer features are now hidden",
    });
    
    if (newMode) {
      setShowDevPanel(true);
    } else {
      setShowDevPanel(false);
    }
  };

  const openDevPanel = () => {
    setShowDevPanel(true);
  };

  const closeDevPanel = () => {
    setShowDevPanel(false);
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
        onComplete={handleEntryAnimationComplete} 
        showTestButton={isDeveloperMode}
      />
      
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
          
          <DevModeToggle
            isDeveloperMode={isDeveloperMode}
            toggleDeveloperMode={toggleDeveloperMode}
            openDevPanel={openDevPanel}
          />
        </>
      ) : (
        <>
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
          
          <DevModeToggle
            isDeveloperMode={isDeveloperMode}
            toggleDeveloperMode={toggleDeveloperMode}
            openDevPanel={openDevPanel}
          />
        </>
      ))}
      
      {showDevPanel && isDeveloperMode && (
        <DevModePanel onClose={closeDevPanel} />
      )}
    </Layout>
  );
};

export default Index;
