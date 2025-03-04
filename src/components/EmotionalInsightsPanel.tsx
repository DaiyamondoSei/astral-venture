
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, ArrowUpCircle, LineChart, Star, Droplets } from 'lucide-react';
import { fetchUserReflections } from '@/services/reflectionService';
import HumanSilhouette from './entry-animation/cosmic/HumanSilhouette';
import { CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';

const EmotionalInsightsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [emotionalGrowth, setEmotionalGrowth] = useState(0);
  const [activatedChakras, setActivatedChakras] = useState<number[]>([]);
  const [dominantEmotions, setDominantEmotions] = useState<string[]>([]);
  const [insightMessages, setInsightMessages] = useState<string[]>([]);
  const { user } = useAuth();

  // Get user dream from localStorage
  const userDream = typeof window !== 'undefined' ? localStorage.getItem('userDream') : null;
  const dominantTheme = typeof window !== 'undefined' ? localStorage.getItem('dominantDreamTheme') : null;

  useEffect(() => {
    const analyzeEmotionalJourney = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch user reflections
        const reflections = await fetchUserReflections(user.id, 10);
        
        // This would ideally use real NLP/AI analysis,
        // but for now we'll use reflection count and content as a proxy
        const reflectionCount = reflections.length;
        
        // Calculate emotional growth (0-100)
        const growth = Math.min(reflectionCount * 10, 100);
        setEmotionalGrowth(growth);
        
        // Determine which chakras would be active based on reflections and dreams
        const chakras: number[] = [];
        const emotions: string[] = [];
        const insights: string[] = [];
        
        // Add dream-based chakra activations first
        if (dominantTheme) {
          switch(dominantTheme) {
            case 'love':
              chakras.push(2); // Heart
              emotions.push('Love & Compassion');
              insights.push('Your heart energy radiates strongly in your practice.');
              break;
            case 'peace':
              chakras.push(1); // Throat
              chakras.push(0); // Crown
              emotions.push('Peace & Tranquility');
              insights.push('You naturally attune to higher states of harmony.');
              break;
            case 'power':
              chakras.push(3); // Solar plexus
              chakras.push(5); // Root
              emotions.push('Confidence & Strength');
              insights.push('Your inner power is awakening as you practice.');
              break;
            case 'wisdom':
              chakras.push(0); // Third eye
              chakras.push(1); // Crown
              emotions.push('Wisdom & Insight');
              insights.push('Your intuitive abilities are expanding rapidly.');
              break;
            case 'creativity':
              chakras.push(4); // Sacral
              chakras.push(1); // Throat
              emotions.push('Creativity & Expression');
              insights.push('Your creative energy seeks greater channels of expression.');
              break;
            case 'spirituality':
              chakras.push(0); // Crown
              chakras.push(2); // Heart
              emotions.push('Spiritual Connection');
              insights.push('Your consciousness is expanding into higher dimensions.');
              break;
            case 'healing':
              chakras.push(2); // Heart
              chakras.push(5); // Root
              emotions.push('Healing & Transformation');
              insights.push('You are in an important healing cycle right now.');
              break;
            default:
              break;
          }
        }
        
        // Analyze reflection content for emotional themes (simple keyword search)
        const combinedReflections = reflections.map(r => r.content).join(' ').toLowerCase();
        
        // Track emotional keywords frequency
        const emotionalAnalysis = {
          love: 0,
          joy: 0,
          peace: 0,
          power: 0,
          wisdom: 0,
          creativity: 0,
          fear: 0,
          anger: 0,
          sadness: 0
        };
        
        const keywords = {
          love: ['love', 'compassion', 'heart', 'connect', 'relationship'],
          joy: ['joy', 'happy', 'delight', 'bliss', 'pleasure'],
          peace: ['peace', 'calm', 'tranquil', 'harmony', 'balance'],
          power: ['power', 'strength', 'confidence', 'achieve', 'success'],
          wisdom: ['wisdom', 'insight', 'knowledge', 'understand', 'awareness'],
          creativity: ['create', 'imagine', 'express', 'inspire', 'art'],
          fear: ['fear', 'worry', 'anxiety', 'stress', 'concern'],
          anger: ['anger', 'frustration', 'irritation', 'rage', 'upset'],
          sadness: ['sad', 'grief', 'depression', 'melancholy', 'down']
        };
        
        // Count keyword occurrences
        Object.entries(keywords).forEach(([emotion, words]) => {
          words.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = combinedReflections.match(regex);
            if (matches) {
              emotionalAnalysis[emotion] += matches.length;
            }
          });
        });
        
        // Get top emotions
        const topEmotions = Object.entries(emotionalAnalysis)
          .sort((a, b) => b[1] - a[1])
          .filter(([_, count]) => count > 0)
          .slice(0, 3)
          .map(([emotion]) => emotion);
          
        // Add emotions to result if not already included
        topEmotions.forEach(emotion => {
          // Capitalize first letter
          const formattedEmotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);
          if (!emotions.includes(formattedEmotion)) {
            emotions.push(formattedEmotion);
          }
          
          // Add related insights
          switch(emotion) {
            case 'love':
              if (!chakras.includes(2)) chakras.push(2); // Heart
              insights.push('Your heart-centered approach strengthens your connections.');
              break;
            case 'joy':
              if (!chakras.includes(3)) chakras.push(3); // Solar plexus
              insights.push('Joy is becoming a more consistent state in your practice.');
              break;
            case 'peace':
              if (!chakras.includes(1)) chakras.push(1); // Throat
              insights.push('Your ability to remain centered is growing stronger.');
              break;
            case 'power':
              if (!chakras.includes(3)) chakras.push(3); // Solar plexus
              insights.push('You're learning to harness your personal power effectively.');
              break;
            case 'wisdom':
              if (!chakras.includes(0)) chakras.push(0); // Third eye
              insights.push('Your capacity for deeper insights is expanding.');
              break;
            case 'creativity':
              if (!chakras.includes(4)) chakras.push(4); // Sacral
              insights.push('Creative energy is flowing more freely in your practice.');
              break;
            case 'fear':
              insights.push('Working through fear is part of your growth journey now.');
              break;
            case 'anger':
              insights.push('Transforming anger into constructive energy is a current lesson.');
              break;
            case 'sadness':
              insights.push('Processing emotions fully is creating space for new energy.');
              break;
          }
        });
        
        // Add reflection-count based chakras as a fallback
        if (reflectionCount >= 1 && !chakras.includes(5)) chakras.push(5); // Root
        if (reflectionCount >= 3 && !chakras.includes(4)) chakras.push(4); // Sacral
        if (reflectionCount >= 5 && !chakras.includes(3)) chakras.push(3); // Solar
        if (reflectionCount >= 7 && !chakras.includes(2)) chakras.push(2); // Heart
        if (reflectionCount >= 9 && !chakras.includes(1)) chakras.push(1); // Throat
        if (reflectionCount >= 12 && !chakras.includes(0)) chakras.push(0); // Crown
        
        // Set the results
        setActivatedChakras(chakras);
        setDominantEmotions(emotions);
        setInsightMessages(insights);
      } catch (error) {
        console.error('Error analyzing emotional journey:', error);
      } finally {
        setLoading(false);
      }
    };
    
    analyzeEmotionalJourney();
  }, [user, dominantTheme]);

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
          
          {userDream && (
            <div className="px-4 py-3 bg-black/20 rounded-lg">
              <div className="flex items-center mb-2">
                <Droplets size={16} className="text-primary mr-2" />
                <span className="text-white/80 text-sm">Dream Energy Analysis</span>
              </div>
              <p className="text-xs text-white/70 italic mb-2">
                "{userDream.length > 120 ? userDream.substring(0, 120) + '...' : userDream}"
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {dominantEmotions.slice(0, 2).map((emotion, index) => (
                  <span key={index} className="text-xs px-2 py-0.5 rounded-full bg-quantum-500/20 text-white/80">
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="px-4 py-3 bg-black/20 rounded-lg">
            <div className="flex items-center mb-2">
              <ArrowUpCircle size={16} className="text-primary mr-2" />
              <span className="text-white/80 text-sm">Emotional Growth Insights</span>
            </div>
            <ul className="space-y-1 text-xs text-white/70">
              {insightMessages.slice(0, 3).map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
              {insightMessages.length === 0 && (
                <li>Continue reflecting to unlock more insights</li>
              )}
            </ul>
          </div>
          
          <div className="px-4 py-3 bg-black/20 rounded-lg">
            <div className="flex items-center mb-2">
              <Star size={16} className="text-primary mr-2" />
              <span className="text-white/80 text-sm">Active Energy Centers</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {activatedChakras.map((chakraIndex) => (
                <span 
                  key={chakraIndex} 
                  className="text-xs px-2 py-0.5 rounded-full bg-quantum-500/20 text-white/80"
                >
                  {CHAKRA_NAMES[chakraIndex]}
                </span>
              ))}
            </div>
            <p className="text-xs text-white/70 mt-2">
              {activatedChakras.length <= 2 && 'Your energy centers are beginning to activate.'}
              {activatedChakras.length > 2 && activatedChakras.length <= 4 && 'Your energy system is developing balance.'}
              {activatedChakras.length > 4 && 'Your energy system is approaching higher integration.'}
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
