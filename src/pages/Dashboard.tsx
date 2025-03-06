
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import SeedOfLife from '@/components/SeedOfLife';
import EnergyAvatar from '@/components/EnergyAvatar';
import ProgressTracker from '@/components/ProgressTracker';
import { Button } from '@/components/ui/button';
import { Sparkles, Book, Trophy, Settings } from 'lucide-react';
import AchievementProgressTracker from '@/components/onboarding/AchievementProgressTracker';
import { useAuth } from '@/contexts/AuthContext';
import { calculateEmotionalGrowth } from '@/utils/emotion/chakra/emotionalGrowth';

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userLevel] = useState(1);
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const { user } = useAuth();
  
  // Mock user data
  const userData = {
    name: 'Astral Explorer',
    progress: {
      overall: 12,
      meditation: 23,
      energy: 15,
      astral: 8,
      dreams: 0
    }
  };

  useEffect(() => {
    // Show progress tracker after a short delay
    const timer = setTimeout(() => {
      setShowProgressTracker(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate emotional growth percentage for progress tracking
  const getEmotionalGrowthPercentage = () => {
    return calculateEmotionalGrowth({
      reflectionCount: 5,
      emotionalDepth: 0.7,
      activatedChakras: [0, 1, 3],
      dominantEmotions: ['calm', 'hopeful'],
      streakDays: 3
    });
  };
  
  return (
    <Layout>
      <div className="flex flex-col space-y-8 pt-4 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h1 className="text-3xl font-display font-medium glow-text">Quanex</h1>
            <p className="text-muted-foreground">Welcome back, {userData.name}</p>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" size="icon" className="glass">
              <Book size={18} />
            </Button>
            <Button variant="outline" size="icon" className="glass">
              <Trophy size={18} />
            </Button>
            <Button variant="outline" size="icon" className="glass">
              <Settings size={18} />
            </Button>
          </div>
        </div>
        
        {/* Energy Level */}
        <div className="flex flex-col items-center space-y-6">
          <EnergyAvatar level={userLevel} />
          <ProgressTracker 
            progress={userData.progress.overall} 
            label="Overall Progress"
            className="max-w-xs"
            animation="pulse"
            glowIntensity="medium"
          />
        </div>
        
        {/* Seed of Life Navigation */}
        <div className="mt-8 max-w-xl mx-auto">
          <SeedOfLife 
            onCategorySelect={setSelectedCategory}
            className="mx-auto"
          />
        </div>
        
        {/* Daily exercise prompt */}
        <div className="glass-card max-w-lg mx-auto p-6 animate-fade-in">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <h3 className="font-display text-lg">Daily Quantum Practice</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Connect with your energy field through a simple 5-minute meditation practice.
          </p>
          <Button className="astral-button w-full">
            Begin Practice
          </Button>
        </div>
      </div>
      
      {/* Achievement Progress Tracker */}
      {showProgressTracker && (
        <AchievementProgressTracker 
          progressPercentage={getEmotionalGrowthPercentage()} 
          totalPoints={115}
        />
      )}
    </Layout>
  );
};

export default Dashboard;
