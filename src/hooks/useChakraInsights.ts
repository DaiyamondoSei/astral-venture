
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChakraActivated } from '@/utils/emotion/chakraTypes';
import { ChakraInsightsService } from '@/services/chakra/ChakraInsightsService';

interface UseChakraInsightsResult {
  personalizedInsights: string[];
  practiceRecommendations: string[];
  loading: boolean;
}

/**
 * Hook to get personalized chakra insights and practice recommendations
 * based on activated chakras and dominant emotions
 */
export function useChakraInsights(
  activatedChakras?: ChakraActivated, 
  dominantEmotions: string[] = []
): UseChakraInsightsResult {
  const [personalizedInsights, setPersonalizedInsights] = useState<string[]>([]);
  const [practiceRecommendations, setPracticeRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchPersonalizedContent = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { personalizedInsights, practiceRecommendations } = 
          await ChakraInsightsService.getPersonalizedInsights(
            user.id,
            activatedChakras,
            dominantEmotions
          );
        
        if (isMounted) {
          setPersonalizedInsights(personalizedInsights);
          setPracticeRecommendations(practiceRecommendations);
        }
      } catch (error) {
        console.error('Error fetching personalized content:', error);
        if (isMounted) {
          setPersonalizedInsights(['Continue your reflection practice to deepen your insights.']);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchPersonalizedContent();
    
    return () => {
      isMounted = false;
    };
  }, [user, activatedChakras, dominantEmotions]);

  return {
    personalizedInsights,
    practiceRecommendations,
    loading
  };
}
