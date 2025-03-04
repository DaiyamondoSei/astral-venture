
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
import CosmicAstralBody from '@/components/entry-animation/CosmicAstralBody'; 
import StreakTracker from '@/components/StreakTracker';
import RecalibrationDialog from '@/components/RecalibrationDialog';
import { incrementEnergyPoints } from '@/integrations/supabase/client';

const Index = () => {
  const [showEntryAnimation, setShowEntryAnimation] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [activatedChakras, setActivatedChakras] = useState<number[]>([]);
  const [userStreak, setUserStreak] = useState({ current: 0, longest: 0 });
  const [showRecalibration, setShowRecalibration] = useState(false);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, todayChallenge, isLoading: profileLoading, updateUserProfile } = useUserProfile();

  // Fetch user streak data
  useEffect(() => {
    const fetchUserStreak = async () => {
      if (!user) return;
      
      try {
        // Get streak data
        const { data: streakData, error: streakError } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (streakError) throw streakError;
        
        if (streakData) {
          setUserStreak({
            current: streakData.current_streak || 0,
            longest: streakData.longest_streak || 0
          });
          
          // Get activated chakras for this week
          const today = new Date();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
          startOfWeek.setHours(0, 0, 0, 0);
          
          const { data: chakraData, error: chakraError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .gte('completed_at', startOfWeek.toISOString())
            .order('completed_at', { ascending: false });
            
          if (chakraError) throw chakraError;
          
          if (chakraData) {
            // Extract day of week from each completed challenge
            const activatedDays = chakraData.map(item => {
              const date = new Date(item.completed_at);
              return date.getDay(); // 0-6 (Sunday-Saturday)
            });
            
            setActivatedChakras([...new Set(activatedDays)]);
          }
        }
      } catch (error) {
        console.error('Error fetching user streak:', error);
      }
    };
    
    fetchUserStreak();
  }, [user]);

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

  const handleChakraActivation = async (chakraIndex: number) => {
    if (!user || !userProfile) return;
    
    try {
      // Record the chakra activation
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          category: 'chakra_activation',
          challenge_id: `chakra_${chakraIndex}`,
          completed_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Add activated chakra to local state
      setActivatedChakras(prev => [...prev, chakraIndex]);
      
      // Give energy points for the activation (different points for each chakra)
      const pointsEarned = 10 + (chakraIndex * 5);
      const newPoints = await incrementEnergyPoints(user.id, pointsEarned);
      
      // Update user profile with new points
      updateUserProfile({
        energy_points: newPoints
      });
      
      // Update streak
      const newStreak = userStreak.current + 1;
      const newLongest = Math.max(newStreak, userStreak.longest);
      
      await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      setUserStreak({
        current: newStreak,
        longest: newLongest
      });
      
      toast({
        title: `${CHAKRA_NAMES[chakraIndex]} Chakra Activated!`,
        description: `+${pointsEarned} cosmic energy points earned`,
      });
      
    } catch (error: any) {
      console.error('Error activating chakra:', error);
      toast({
        title: "Activation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleRecalibrationComplete = async (reflection: string) => {
    if (!user || !userProfile) return;
    
    try {
      // Get the missed days (days of week without activations)
      const today = new Date();
      const currentDay = today.getDay();
      const allDays = Array.from({ length: currentDay }, (_, i) => i);
      const missedDays = allDays.filter(day => !activatedChakras.includes(day));
      
      // Record the recalibration
      for (const missedDay of missedDays) {
        await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            category: 'chakra_recalibration',
            challenge_id: `chakra_${missedDay}`,
            completed_at: new Date().toISOString(),
            reflection
          });
      }
      
      // Update activated chakras to include recovered days
      setActivatedChakras(prev => [...prev, ...missedDays]);
      
      // Give some energy points for the recalibration
      const pointsEarned = Math.max(5, missedDays.length * 2);
      const newPoints = await incrementEnergyPoints(user.id, pointsEarned);
      
      // Update user profile with new points
      updateUserProfile({
        energy_points: newPoints
      });
      
      // Update streak - restore it to the current day
      const newStreak = currentDay + 1;
      const newLongest = Math.max(newStreak, userStreak.longest);
      
      await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      setUserStreak({
        current: newStreak,
        longest: newLongest
      });
      
      setShowRecalibration(false);
      
      toast({
        title: "Energy Recalibrated",
        description: `Your chakra flow has been restored. +${pointsEarned} energy points.`,
      });
      
    } catch (error: any) {
      console.error('Error completing recalibration:', error);
      toast({
        title: "Recalibration failed",
        description: error.message,
        variant: "destructive"
      });
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
              
              {/* Cosmic body visualization */}
              <div className="mb-8">
                <CosmicAstralBody 
                  energyPoints={userProfile?.energy_points || 0}
                  streakDays={userStreak.current}
                  activatedChakras={activatedChakras}
                />
              </div>
              
              {/* Streak tracker */}
              <div className="mb-8">
                <StreakTracker 
                  currentStreak={userStreak.current}
                  longestStreak={userStreak.longest}
                  activatedChakras={activatedChakras}
                  onChakraActivation={handleChakraActivation}
                  onRecalibration={() => setShowRecalibration(true)}
                />
              </div>
              
              <RecalibrationDialog 
                open={showRecalibration}
                onOpenChange={setShowRecalibration}
                onComplete={handleRecalibrationComplete}
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
