
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import GlowEffect from './GlowEffect';
import { CheckCircle, Clock, Zap, BookOpen, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CategoryExperienceProps {
  category: string;
  onComplete?: (pointsEarned: number) => void;
}

const CategoryExperience = ({ category, onComplete }: CategoryExperienceProps) => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'practice' | 'wisdom'>('practice');
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
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

  const completeChallenge = async () => {
    if (!user || !selectedChallenge) return;
    
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
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          energy_points: supabase.rpc('increment', { x: selectedChallenge.energy_points }),
          last_active_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Challenge Completed!',
        description: `You've earned ${selectedChallenge.energy_points} energy points`,
      });

      if (onComplete) {
        onComplete(selectedChallenge.energy_points);
      }

      setSelectedChallenge(null);
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

  const getCategoryGradient = () => {
    switch (category) {
      case 'meditation': return 'from-quantum-300 to-quantum-600';
      case 'energy': return 'from-ethereal-300 to-ethereal-600';
      case 'connection': return 'from-ethereal-400 to-ethereal-600';
      case 'astral': return 'from-astral-300 to-astral-600';
      case 'dreams': return 'from-quantum-400 to-quantum-700';
      case 'manifestation': return 'from-astral-300 to-quantum-500';
      case 'intention': return 'from-astral-400 to-astral-600';
      case 'chakras': return 'from-ethereal-300 to-astral-500';
      case 'quantum': return 'from-quantum-300 to-quantum-600';
      case 'healing': return 'from-ethereal-300 to-ethereal-600';
      case 'awareness': return 'from-astral-300 to-astral-600';
      case 'breathwork': return 'from-quantum-400 to-quantum-600';
      case 'guidance': return 'from-quantum-300 to-astral-500';
      default: return 'from-quantum-300 to-quantum-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center mb-6">
        <GlowEffect 
          className={`w-16 h-16 mb-4 rounded-full bg-gradient-to-br ${getCategoryGradient()} flex items-center justify-center`}
        >
          <div className="text-white text-lg font-semibold">{displayCategory.charAt(0)}</div>
        </GlowEffect>
        <h2 className="text-2xl font-display font-medium text-white">{displayCategory} Path</h2>
        <p className="text-white/70 mt-1">Expand your consciousness through {displayCategory.toLowerCase()} practices</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'practice' ? 'text-white border-b-2 border-primary' : 'text-white/60'}`}
          onClick={() => setActiveTab('practice')}
        >
          Practice
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'wisdom' ? 'text-white border-b-2 border-primary' : 'text-white/60'}`}
          onClick={() => setActiveTab('wisdom')}
        >
          Quantum Wisdom
        </button>
      </div>

      {/* Challenge or Wisdom Content */}
      <div className="pt-4">
        {activeTab === 'practice' ? (
          <>
            {selectedChallenge ? (
              <div className="glass-card p-6 animate-fade-in">
                <div className="mb-6">
                  <h3 className="text-xl font-display mb-2">{selectedChallenge.title}</h3>
                  <p className="text-white/80">{selectedChallenge.description}</p>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-white/60" />
                    <span className="text-white/60 text-sm">{selectedChallenge.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center">
                    <Zap size={16} className="mr-2 text-primary" />
                    <span className="text-primary text-sm">+{selectedChallenge.energy_points} points</span>
                  </div>
                </div>
                
                <Button 
                  onClick={completeChallenge}
                  className={`w-full bg-gradient-to-r ${getCategoryGradient()} hover:opacity-90`}
                >
                  <CheckCircle size={18} className="mr-2" />
                  Mark Complete
                </Button>
                
                <button 
                  onClick={() => setSelectedChallenge(null)}
                  className="w-full text-center mt-3 text-white/60 text-sm hover:text-white"
                >
                  Choose Another Challenge
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div 
                    key={challenge.id}
                    onClick={() => setSelectedChallenge(challenge)}
                    className="glass-card p-4 cursor-pointer hover:bg-white/5 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{challenge.title}</h3>
                      <div className="flex mt-1 text-sm">
                        <span className="flex items-center text-white/60 mr-4">
                          <Clock size={14} className="mr-1" />
                          {challenge.duration_minutes} min
                        </span>
                        <span className="flex items-center text-primary">
                          <Zap size={14} className="mr-1" />
                          {challenge.energy_points} points
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-white/40" />
                  </div>
                ))}
                
                {challenges.length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    No challenges available for this category yet
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {downloads.map((download) => (
              <div key={download.id} className="glass-card p-5">
                <div className="flex items-center mb-2">
                  <BookOpen size={18} className="mr-2 text-primary" />
                  <h3 className="font-display">{download.title}</h3>
                </div>
                <p className="text-white/80">{download.content}</p>
              </div>
            ))}
            
            {downloads.length === 0 && (
              <div className="text-center py-8 text-white/60">
                No quantum wisdom available for this category yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryExperience;
