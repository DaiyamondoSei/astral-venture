import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserReflections } from '@/services/reflectionService';

export const useEmotionalAnalysis = () => {
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

  return {
    loading,
    emotionalGrowth,
    activatedChakras,
    dominantEmotions,
    insightMessages,
    getChakraIntensity,
    userDream
  };
};
