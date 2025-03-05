
import { useState, useEffect } from 'react';
import { useUserReflections } from '@/hooks/useUserReflections';
import { calculateEmotionalGrowth } from '@/utils/emotion';
import { 
  analyzeChakraActivation,
  getChakraIntensity
} from '@/utils/emotion/chakraAnalysis';
import {
  generateChakraBalanceData,
  generateEmotionalHistoryData,
  generateRecommendations
} from '@/utils/emotion/visualizationUtils';

export const useEmotionalAnalysis = () => {
  const [emotionalGrowth, setEmotionalGrowth] = useState(0);
  const [activatedChakras, setActivatedChakras] = useState<number[]>([]);
  const [dominantEmotions, setDominantEmotions] = useState<string[]>([]);
  const [insightMessages, setInsightMessages] = useState<string[]>([]);
  const [chakraBalanceData, setChakraBalanceData] = useState<any[]>([]);
  const [emotionalHistoryData, setEmotionalHistoryData] = useState<any>({ timeline: [], milestones: [] });
  const [emotionalRecommendations, setEmotionalRecommendations] = useState<any[]>([]);

  // Get user reflections using the dedicated hook
  const { loading, reflections, depthScores, reflectionCount } = useUserReflections();

  // Get user dream from localStorage
  const userDream = typeof window !== 'undefined' ? localStorage.getItem('userDream') : null;
  const dominantTheme = typeof window !== 'undefined' ? localStorage.getItem('dominantDreamTheme') : null;

  useEffect(() => {
    if (loading) return;
    
    try {
      // Calculate emotional growth based on reflection count with enhanced algorithm
      const growth = calculateEmotionalGrowth(reflectionCount);
      setEmotionalGrowth(growth);
      
      // Analyze chakras and emotions
      const { chakras, emotions, insights } = analyzeChakraActivation(reflections, dominantTheme);
      
      if (reflections.length > 0) {
        // Generate chakra balance data for radar chart
        const chakraBalanceValues = generateChakraBalanceData(chakras, emotions);
        setChakraBalanceData(chakraBalanceValues);
        
        // Generate emotional history timeline
        const historyData = generateEmotionalHistoryData(reflections, depthScores);
        setEmotionalHistoryData(historyData);
        
        // Generate personalized recommendations based on analysis
        const recommendations = generateRecommendations(chakras, emotions);
        setEmotionalRecommendations(recommendations);
      }
      
      // Set the results
      setActivatedChakras(chakras);
      setDominantEmotions(emotions);
      setInsightMessages(insights);
    } catch (error) {
      console.error('Error analyzing emotional journey:', error);
    }
  }, [loading, reflections, depthScores, reflectionCount, dominantTheme]);

  // Create a wrapper for the chakra intensity function to pass to components
  const getChakraIntensityWrapper = (chakraIndex: number) => {
    return getChakraIntensity(chakraIndex, activatedChakras, emotionalGrowth);
  };

  return {
    loading,
    emotionalGrowth,
    activatedChakras,
    dominantEmotions,
    insightMessages,
    getChakraIntensity: getChakraIntensityWrapper,
    userDream,
    chakraBalanceData,
    emotionalHistoryData,
    emotionalRecommendations
  };
};
