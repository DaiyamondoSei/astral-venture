
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
  const [isDeveloperMode, setIsDeveloperMode] = useState(() => {
    return localStorage.getItem('developerMode') === 'true';
  });

  useEffect(() => {
    // Check if user just logged in and hasn't seen the entry animation yet
    if (user && !localStorage.getItem(`entry-animation-shown-${user.id}`)) {
      // Check if dream capture is completed already
      const dreamCaptureCompleted = localStorage.getItem('dreamCaptureCompleted');
      
      if (!dreamCaptureCompleted) {
        // Redirect to dream capture first
        navigate('/dream-capture');
      } else {
        // If dream capture is done, show regular entry animation
        setShowEntryAnimation(true);
      }
    }
  }, [user, navigate]);

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

  const handleChallengeComplete = async (pointsEarned: number, emotionalInsights?: any) => {
    if (!userProfile) return;
    
    updateUserProfile({
      energy_points: userProfile.energy_points + pointsEarned
    });
    
    // If emotional insights are provided, update activated chakras
    if (emotionalInsights && emotionalInsights.chakrasActivated && emotionalInsights.chakrasActivated.length > 0) {
      // Merge with existing chakras (avoiding duplicates)
      const newChakras = [...activatedChakras];
      emotionalInsights.chakrasActivated.forEach((chakraIndex: number) => {
        if (!newChakras.includes(chakraIndex)) {
          newChakras.push(chakraIndex);
        }
      });
      
      updateActivatedChakras(newChakras);
      
      // Customize message based on newly activated chakras
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
      description: newMode ? "You can now access testing features" : "Testing features are now hidden",
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
          
          {/* Developer Mode Toggle */}
          <div className="fixed bottom-4 left-4 opacity-30 hover:opacity-100 transition-opacity">
            <button 
              onClick={toggleDeveloperMode}
              className="text-xs text-white/50 hover:text-white/80 flex items-center"
            >
              <span className="sr-only">Developer Mode</span>
              <span className={`w-3 h-3 rounded-full mr-1 ${isDeveloperMode ? 'bg-green-500' : 'bg-gray-500'}`}></span>
            </button>
          </div>
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
          
          {/* Developer Mode Toggle (also show for logged in users) */}
          <div className="fixed bottom-4 left-4 opacity-30 hover:opacity-100 transition-opacity">
            <button 
              onClick={toggleDeveloperMode}
              className="text-xs text-white/50 hover:text-white/80 flex items-center"
            >
              <span className="sr-only">Developer Mode</span>
              <span className={`w-3 h-3 rounded-full mr-1 ${isDeveloperMode ? 'bg-green-500' : 'bg-gray-500'}`}></span>
            </button>
          </div>
        </>
      ))}
    </Layout>
  );
};

export default Index;
