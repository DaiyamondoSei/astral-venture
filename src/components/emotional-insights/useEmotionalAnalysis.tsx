
import { useState, useEffect } from 'react';
import { useUserReflections } from '@/hooks/useUserReflections';
import { 
  calculateEmotionalGrowth, 
  analyzeChakraActivation,
  getChakraIntensity
} from '@/utils/emotion';
import {
  generateChakraBalanceData,
  generateEmotionalHistoryData,
  generateRecommendations
} from '@/utils/emotion/visualizationUtils';
import { fetchEmotionalJourney } from '@/services/reflectionService';
import { useAuth } from '@/contexts/AuthContext';

export const useEmotionalAnalysis = () => {
  const [emotionalGrowth, setEmotionalGrowth] = useState(0);
  const [activatedChakras, setActivatedChakras] = useState<number[]>([]);
  const [dominantEmotions, setDominantEmotions] = useState<string[]>([]);
  const [insightMessages, setInsightMessages] = useState<string[]>([]);
  const [chakraBalanceData, setChakraBalanceData] = useState<any[]>([]);
  const [emotionalHistoryData, setEmotionalHistoryData] = useState<any>({ timeline: [], milestones: [] });
  const [emotionalRecommendations, setEmotionalRecommendations] = useState<any[]>([]);
  const [journeyData, setJourneyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get user reflections using the dedicated hook
  const { reflections, depthScores, reflectionCount } = useUserReflections();
  const { user } = useAuth();

  // Get user dream from localStorage
  const userDream = typeof window !== 'undefined' ? localStorage.getItem('userDream') : null;
  const dominantTheme = typeof window !== 'undefined' ? localStorage.getItem('dominantDreamTheme') : null;

  useEffect(() => {
    const fetchJourneyData = async () => {
      if (!user) return;
      
      try {
        const journey = await fetchEmotionalJourney(user.id);
        if (journey) {
          setJourneyData(journey);
        }
      } catch (error) {
        console.error('Error fetching emotional journey:', error);
      }
    };
    
    fetchJourneyData();
  }, [user]);

  useEffect(() => {
    if (loading && reflections.length === 0 && !journeyData) return;
    
    setLoading(false);
    
    try {
      // Use journey data if available, otherwise calculate from reflections
      if (journeyData) {
        // Use the reflectionCount or a complex metrics object based on what's available
        const growthInput = journeyData.recentReflectionCount 
          ? {
              reflectionCount: journeyData.recentReflectionCount,
              emotionalDepth: journeyData.averageEmotionalDepth,
              activatedChakras: journeyData.activatedChakras,
              dominantEmotions: journeyData.dominantEmotions,
              streakDays: 0 // Default value
            }
          : journeyData.recentReflectionCount;
          
        setEmotionalGrowth(calculateEmotionalGrowth(growthInput));
        setActivatedChakras(journeyData.activatedChakras || []);
        setDominantEmotions(journeyData.dominantEmotions || []);
        setInsightMessages(journeyData.insights || []);
      } else {
        // Analyze chakras and emotions
        const { chakras, emotions, insights } = analyzeChakraActivation(reflections, dominantTheme);
        
        // Calculate emotional growth based on reflection count and activated chakras
        const growth = calculateEmotionalGrowth({
          reflectionCount,
          emotionalDepth: depthScores.length > 0 
            ? depthScores.reduce((sum, score) => sum + score, 0) / depthScores.length 
            : 0,
          activatedChakras: chakras,
          dominantEmotions: emotions,
        });
        
        // Set the results
        setEmotionalGrowth(growth);
        setActivatedChakras(chakras);
        setDominantEmotions(emotions);
        setInsightMessages(insights);
      }
      
      if (reflections.length > 0) {
        // Generate chakra balance data for radar chart
        const chakraBalanceValues = generateChakraBalanceData(
          activatedChakras, 
          dominantEmotions
        );
        setChakraBalanceData(chakraBalanceValues);
        
        // Generate emotional history timeline
        const historyData = generateEmotionalHistoryData(reflections, depthScores);
        setEmotionalHistoryData(historyData);
        
        // Generate personalized recommendations based on analysis
        const recommendations = generateRecommendations(activatedChakras, dominantEmotions);
        setEmotionalRecommendations(recommendations);
      }
    } catch (error) {
      console.error('Error analyzing emotional journey:', error);
      setLoading(false);
    }
  }, [loading, reflections, depthScores, reflectionCount, dominantTheme, journeyData, activatedChakras, dominantEmotions]);

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
    emotionalRecommendations,
    journeyData
  };
};
