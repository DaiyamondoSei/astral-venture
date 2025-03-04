
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import EntryAnimation from '@/components/EntryAnimation';
import SeedOfLife from '@/components/SeedOfLife';
import EnergyAvatar from '@/components/EnergyAvatar';
import ProgressTracker from '@/components/ProgressTracker';
import CategoryExperience from '@/components/CategoryExperience';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import AuthForms from '@/components/AuthForms';
import { supabase } from '@/integrations/supabase/client';
import GlowEffect from '@/components/GlowEffect';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Award, Sparkles } from 'lucide-react';

const Index = () => {
  const [showEntryAnimation, setShowEntryAnimation] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [todayChallenge, setTodayChallenge] = useState<any>(null);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if this is the first time visiting
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedQuanex');
    if (!hasVisited && user) {
      setShowEntryAnimation(true);
      localStorage.setItem('hasVisitedQuanex', 'true');
    } else {
      setFirstLoad(false);
    }
  }, [user]);

  // Fetch user profile and today's challenge when user is authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          // Fetch user profile
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          setUserProfile(data);
          
          // Fetch a random challenge for today
          const { data: challengeData, error: challengeError } = await supabase
            .from('challenges')
            .select('*')
            .limit(1)
            .order('id', { ascending: false });
            
          if (challengeError) throw challengeError;
          
          if (challengeData && challengeData.length > 0) {
            setTodayChallenge(challengeData[0]);
          }
        } catch (error: any) {
          console.error('Error fetching user profile:', error);
          toast({
            title: "Failed to load profile",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    };
    
    if (user) {
      fetchUserProfile();
    }
  }, [user, toast]);

  const handleEntryAnimationComplete = () => {
    setShowEntryAnimation(false);
    setFirstLoad(false);
  };

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
  };
  
  const handleChallengeComplete = async (pointsEarned: number) => {
    if (!userProfile) return;
    
    // Update local state
    setUserProfile({
      ...userProfile,
      energy_points: userProfile.energy_points + pointsEarned
    });
    
    toast({
      title: "Energy Points Increased!",
      description: `+${pointsEarned} points added to your profile`,
    });
  };

  if (isLoading) {
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
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl md:text-5xl font-display font-medium mb-4 text-white glow-text"
                >
                  Welcome to Quanex
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-lg text-white/80"
                >
                  Your journey to expanded consciousness begins here
                </motion.p>
              </div>
              
              <AuthForms className="mt-8" />
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="container mx-auto px-4 py-8"
            >
              <div className="flex flex-col md:flex-row md:items-center mb-8">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-display font-medium text-white">
                    Welcome, {userProfile?.username || user.email?.split('@')[0] || 'Seeker'}
                  </h1>
                  <p className="text-white/70 mt-1">Continue your quantum journey</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <EnergyAvatar level={userProfile?.astral_level || 1} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-4">
                  <h3 className="font-display text-lg mb-3">Energy Progress</h3>
                  <ProgressTracker progress={userProfile?.energy_points || 0} label="Energy Points" />
                </div>
                
                <div className="glass-card p-4">
                  <h3 className="font-display text-lg mb-3">Today's Challenge</h3>
                  {todayChallenge ? (
                    <div>
                      <p className="text-white/90 mb-2">{todayChallenge.title}</p>
                      <div className="flex items-center text-sm">
                        <Sparkles size={14} className="mr-1 text-primary" />
                        <span>{todayChallenge.energy_points} energy points</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/70 text-sm">Complete your daily quantum challenge to advance</p>
                  )}
                </div>
                
                <div className="glass-card p-4">
                  <h3 className="font-display text-lg mb-3">Astral Level</h3>
                  <div className="flex items-center">
                    <div className="text-3xl font-display text-white mr-2">{userProfile?.astral_level || 1}</div>
                    <div className="text-white/70 text-sm">Awakened Seeker</div>
                  </div>
                </div>
              </div>
              
              {!activeCategory ? (
                <div className="my-16">
                  <SeedOfLife className="w-full max-w-3xl mx-auto" onCategorySelect={handleCategorySelect} />
                  <div className="text-center mt-8 text-white/70">
                    <p>Select a category to begin your practice</p>
                  </div>
                </div>
              ) : (
                <div className="my-8 max-w-2xl mx-auto">
                  <button 
                    onClick={() => setActiveCategory(null)}
                    className="mb-6 text-white/70 hover:text-white flex items-center"
                  >
                    ← Back to Seed of Life
                  </button>
                  
                  <CategoryExperience 
                    category={activeCategory} 
                    onComplete={handleChallengeComplete}
                  />
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </Layout>
  );
};

export default Index;
