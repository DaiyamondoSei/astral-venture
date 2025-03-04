import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserReflections } from '@/services/reflectionService';
import { 
  analyzeDreamTheme,
  analyzeReflectionContent,
  addReflectionBasedChakras,
  calculateEmotionalGrowth
} from '@/utils/emotionAnalysisUtils';

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
        const reflectionCount = reflections.length;
        
        // Calculate emotional growth based on reflection count
        const growth = calculateEmotionalGrowth(reflectionCount);
        setEmotionalGrowth(growth);
        
        // Start with empty arrays for our analysis results
        let chakras: number[] = [];
        let emotions: string[] = [];
        let insights: string[] = [];
        
        // Analyze dream theme first
        const dreamAnalysis = analyzeDreamTheme(dominantTheme);
        chakras = [...dreamAnalysis.chakras];
        emotions = [...dreamAnalysis.emotions];
        insights = [...dreamAnalysis.insights];
        
        // Analyze reflection content
        if (reflections.length > 0) {
          const combinedReflections = reflections.map(r => r.content).join(' ').toLowerCase();
          const reflectionAnalysis = analyzeReflectionContent(
            combinedReflections,
            chakras,
            emotions,
            insights
          );
          
          chakras = reflectionAnalysis.chakras;
          emotions = reflectionAnalysis.emotions;
          insights = reflectionAnalysis.insights;
        }
        
        // Add chakras based on reflection count as a fallback
        chakras = addReflectionBasedChakras(reflectionCount, chakras);
        
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
