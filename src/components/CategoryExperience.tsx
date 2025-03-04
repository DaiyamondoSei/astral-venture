
import React, { useState, useEffect } from 'react';
import { supabase, incrementEnergyPoints } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import GlowEffect from './GlowEffect';
import ReflectionTab from './ReflectionTab';
import CategoryHeader from './category-experience/CategoryHeader';
import CategoryTabs from './category-experience/CategoryTabs';
import PracticeTab from './category-experience/PracticeTab';
import WisdomTab from './category-experience/WisdomTab';
import { getCategoryGradient } from '@/utils/categoryUtils';

interface CategoryExperienceProps {
  category: string;
  onComplete?: (pointsEarned: number) => void;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  energy_points: number;
  level: number;
  category: string;
}

interface QuantumDownload {
  id: string;
  title: string;
  content: string;
  level: number;
  category: string;
}

const CategoryExperience = ({ category, onComplete }: CategoryExperienceProps) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [downloads, setDownloads] = useState<QuantumDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'practice' | 'wisdom' | 'reflection'>('practice');
  const { toast } = useToast();
  const { user } = useAuth();

  // Capitalize first letter for display
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        // Fetch challenges for this category
        const { data: challengeData, error: challengeError } = await supabase
          .from('challenges')
          .select('*')
          .eq('category', category)
          .order('level', { ascending: true });

        if (challengeError) throw challengeError;
        setChallenges(challengeData || []);

        // Fetch quantum downloads for this category
        const { data: downloadData, error: downloadError } = await supabase
          .from('quantum_downloads')
          .select('*')
          .eq('category', category)
          .order('level', { ascending: true });

        if (downloadError) throw downloadError;
        setDownloads(downloadData || []);
      } catch (error: any) {
        console.error('Error fetching category data:', error.message);
        toast({
          title: 'Failed to load category data',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchCategoryData();
    }
  }, [category, toast]);

  const completeChallenge = async (selectedChallenge: Challenge) => {
    if (!user) return;
    
    try {
      // Record the completed challenge
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          challenge_id: selectedChallenge.id,
          category: category,
        });

      if (error) throw error;

      // Update user energy points
      await incrementEnergyPoints(user.id, selectedChallenge.energy_points);

      toast({
        title: 'Challenge Completed!',
        description: `You've earned ${selectedChallenge.energy_points} energy points`,
      });

      if (onComplete) {
        onComplete(selectedChallenge.energy_points);
      }
    } catch (error: any) {
      console.error('Error completing challenge:', error.message);
      toast({
        title: 'Failed to record progress',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <GlowEffect 
          className="w-12 h-12 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-700"
          animation="pulse"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CategoryHeader 
        category={category} 
        displayCategory={displayCategory} 
        getCategoryGradient={() => getCategoryGradient(category)} 
      />

      <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="pt-4">
        {activeTab === 'practice' ? (
          <PracticeTab 
            challenges={challenges} 
            getCategoryGradient={() => getCategoryGradient(category)} 
            onCompleteChallenge={completeChallenge} 
          />
        ) : activeTab === 'wisdom' ? (
          <WisdomTab downloads={downloads} />
        ) : (
          <ReflectionTab onReflectionComplete={onComplete} />
        )}
      </div>
    </div>
  );
};

export default CategoryExperience;
