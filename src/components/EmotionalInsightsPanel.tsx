import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, ArrowUpCircle, LineChart, Star } from 'lucide-react';
import { fetchUserReflections } from '@/services/reflectionService';
import HumanSilhouette from './entry-animation/cosmic/HumanSilhouette';

const EmotionalInsightsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [emotionalGrowth, setEmotionalGrowth] = useState(0);
  const [activatedChakras, setActivatedChakras] = useState<number[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const analyzeEmotionalJourney = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch user reflections
        const reflections = await fetchUserReflections(user.id, 10);
        
        // This would ideally use real NLP/AI analysis,
        // but for now we'll use reflection count as a simple proxy
        const reflectionCount = reflections.length;
        
        // Calculate emotional growth (0-100)
        const growth = Math.min(reflectionCount * 10, 100);
        setEmotionalGrowth(growth);
        
        // Determine which chakras would be active based on reflections
        // This is a simplified version - would be better with real emotional analysis
        const chakras = [];
        
        // Always activate root chakra if they've done at least 1 reflection
        if (reflectionCount >= 1) chakras.push(5);
        
        // Sacral chakra activates with 2 reflections
        if (reflectionCount >= 2) chakras.push(4);
        
        // Solar plexus with 3
        if (reflectionCount >= 3) chakras.push(3);
        
        // Heart with 5
        if (reflectionCount >= 5) chakras.push(2);
        
        // Throat with 7
        if (reflectionCount >= 7) chakras.push(1);
        
        // Third eye with 9
        if (reflectionCount >= 9) chakras.push(0);
        
        setActivatedChakras(chakras);
      } catch (error) {
        console.error('Error analyzing emotional journey:', error);
      } finally {
        setLoading(false);
      }
    };
    
    analyzeEmotionalJourney();
  }, [user]);

  const getChakraIntensity = (chakraIndex: number) => {
    // Check if this chakra is activated
    if (activatedChakras.includes(chakraIndex)) {
      return 1.0; // Fully activated
    }
    
    // Otherwise return partial intensity based on emotional growth
    return emotionalGrowth / 200; // Half intensity at most
  };

  if (loading) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="h-6 w-1/3 bg-white/10 rounded mb-4"></div>
        <div className="h-4 w-full bg-white/10 rounded mb-2"></div>
        <div className="h-4 w-full bg-white/10 rounded mb-2"></div>
        <div className="h-4 w-3/4 bg-white/10 rounded"></div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <h3 className="font-display text-lg mb-3">Your Emotional Evolution</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <Heart size={18} className="text-rose-400" />
            <span className="text-white/90">Emotional Intelligence</span>
            <div className="ml-auto bg-white/10 rounded-full h-2 w-24">
              <div
                className="bg-gradient-to-r from-rose-400 to-rose-600 h-full rounded-full"
                style={{ width: `${emotionalGrowth}%` }}
              ></div>
            </div>
          </div>
          
          <div className="px-4 py-3 bg-black/20 rounded-lg">
            <div className="flex items-center mb-2">
              <ArrowUpCircle size={16} className="text-primary mr-2" />
              <span className="text-white/80 text-sm">Emotional Growth Areas</span>
            </div>
            <ul className="space-y-1 text-xs text-white/70">
              {activatedChakras.includes(2) && (
                <li>Heart-centered compassion</li>
              )}
              {activatedChakras.includes(1) && (
                <li>Authentic self-expression</li>
              )}
              {activatedChakras.includes(3) && (
                <li>Personal empowerment</li>
              )}
              {activatedChakras.includes(0) && (
                <li>Intuitive perception</li>
              )}
              {!activatedChakras.includes(0) && !activatedChakras.includes(1) && (
                <li>Continue reflecting to unlock more insights</li>
              )}
            </ul>
          </div>
          
          <div className="px-4 py-3 bg-black/20 rounded-lg">
            <div className="flex items-center mb-2">
              <Star size={16} className="text-primary mr-2" />
              <span className="text-white/80 text-sm">Astral Evolution</span>
            </div>
            <p className="text-xs text-white/70">
              Your astral body is evolving based on your reflections. 
              {activatedChakras.length <= 2 && 'Continue your practice to further develop your astral form.'}
              {activatedChakras.length > 2 && activatedChakras.length <= 4 && 'Your energy centers are awakening as you progress.'}
              {activatedChakras.length > 4 && 'Your astral form is reaching higher levels of consciousness.'}
            </p>
          </div>
        </div>
        
        <div className="bg-black/20 rounded-lg relative min-h-[300px]">
          <HumanSilhouette
            showChakras={true}
            showDetails={emotionalGrowth > 30}
            showIllumination={emotionalGrowth > 50}
            showFractal={emotionalGrowth > 70}
            showTranscendence={emotionalGrowth > 90}
            showInfinity={emotionalGrowth > 95}
            baseProgressPercentage={emotionalGrowth / 100}
            getChakraIntensity={getChakraIntensity}
            activatedChakras={activatedChakras}
          />
        </div>
      </div>
    </div>
  );
};

export default EmotionalInsightsPanel;
