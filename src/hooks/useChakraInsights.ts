
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiService } from '@/services/ai/aiService';
import { ChakraActivated, normalizeChakraData } from '@/utils/emotion/chakraTypes';
import { getChakraNames } from '@/utils/emotion/chakraUtils';

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
  
  const normalizedChakras = normalizeChakraData(activatedChakras);
  const chakraNames = getChakraNames(normalizedChakras);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPersonalizedContent = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const recommendations = await aiService.getPersonalizedRecommendations(user.id);
        if (isMounted) {
          setPracticeRecommendations(recommendations.slice(0, 3));
          
          const aiInsights = [];
          
          if (chakraNames.length > 0) {
            const dominantChakra = chakraNames[0];
            aiInsights.push(`Your ${dominantChakra} chakra is currently the most active, suggesting a focus on ${getChakraFocus(dominantChakra)}.`);
          }
          
          if (dominantEmotions.length > 0) {
            const topEmotion = dominantEmotions[0];
            aiInsights.push(`Your reflections show a strong ${topEmotion.toLowerCase()} energy signature.`);
          }
          
          if (chakraNames.length >= 2) {
            aiInsights.push(`The connection between your ${chakraNames[0]} and ${chakraNames[1]} chakras indicates ${getChakraConnectionInsight(chakraNames[0], chakraNames[1])}.`);
          }
          
          setPersonalizedInsights(aiInsights);
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
  }, [user, chakraNames, dominantEmotions]);

  return {
    personalizedInsights,
    practiceRecommendations,
    loading
  };
}

function getChakraFocus(chakra: string): string {
  const focuses = {
    'Root': 'stability and security',
    'Sacral': 'creativity and emotions',
    'Solar Plexus': 'personal power and confidence',
    'Heart': 'love and compassion',
    'Throat': 'communication and expression',
    'Third Eye': 'intuition and wisdom',
    'Crown': 'spiritual connection and higher consciousness'
  };
  
  return focuses[chakra as keyof typeof focuses] || 'energy balance';
}

function getChakraConnectionInsight(chakra1: string, chakra2: string): string {
  if ((chakra1 === 'Heart' && chakra2 === 'Throat') || 
      (chakra1 === 'Throat' && chakra2 === 'Heart')) {
    return 'a deepening connection between love and authentic expression';
  }
  
  if ((chakra1 === 'Third Eye' && chakra2 === 'Crown') || 
      (chakra1 === 'Crown' && chakra2 === 'Third Eye')) {
    return 'an awakening of higher spiritual awareness and intuition';
  }
  
  if ((chakra1 === 'Root' && chakra2 === 'Solar Plexus') || 
      (chakra1 === 'Solar Plexus' && chakra2 === 'Root')) {
    return 'a grounding of your personal power';
  }
  
  return 'a meaningful pattern in your energy system';
}
