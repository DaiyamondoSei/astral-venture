
import { useEffect, useState } from 'react';
import { ChakraActivationService } from '@/services/chakra/ChakraActivationService';
import { ChakraInsightsService } from '@/services/chakra/ChakraInsightsService';

export interface ChakraInsight {
  chakraId: number;
  name: string;
  insight: string;
  severity: 'low' | 'medium' | 'high';
}

export interface PracticeRecommendation {
  id: string;
  title: string;
  description: string;
  chakraId: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export type ChakraActivated = number[];

export interface ChakraInsightsResult {
  insights: ChakraInsight[];
  recommendations: PracticeRecommendation[];
  isLoading: boolean;
  error: string | null;
}

export function useChakraInsights(reflectionText: string, activatedChakras: ChakraActivated): ChakraInsightsResult {
  const [insights, setInsights] = useState<ChakraInsight[]>([]);
  const [recommendations, setRecommendations] = useState<PracticeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateInsights = async () => {
      if (!reflectionText || reflectionText.trim().length < 10) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Generate insights based on the reflection text
        const chakraInsightsService = new ChakraInsightsService();
        const generatedInsights = await chakraInsightsService.generateInsightsFromReflection(
          reflectionText
        );

        // Filter insights related to activated chakras if any are activated
        let filteredInsights = generatedInsights;
        if (activatedChakras && activatedChakras.length > 0) {
          filteredInsights = generatedInsights.filter(insight => 
            activatedChakras.includes(insight.chakraId)
          );
        }

        setInsights(filteredInsights);

        // Generate practice recommendations based on insights
        const chakraService = new ChakraActivationService();
        const practiceRecs = await chakraService.getRecommendedPractices(
          filteredInsights.map(i => i.chakraId)
        );
        
        setRecommendations(practiceRecs);
      } catch (err) {
        console.error('Error generating chakra insights:', err);
        setError('Failed to generate insights. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    generateInsights();
  }, [reflectionText, activatedChakras]);

  return {
    insights,
    recommendations,
    isLoading,
    error
  };
}

export function useChakraBalanceInsights(reflectionHistory: any[], activatedChakras: ChakraActivated): ChakraInsightsResult {
  const [insights, setInsights] = useState<ChakraInsight[]>([]);
  const [recommendations, setRecommendations] = useState<PracticeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateBalanceInsights = async () => {
      if (!reflectionHistory || reflectionHistory.length === 0) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Combine all reflection text for analysis
        const combinedText = reflectionHistory
          .map(r => r.content)
          .join('\n\n');

        // Generate insights based on historical reflection data
        const chakraInsightsService = new ChakraInsightsService();
        const generatedInsights = await chakraInsightsService.generateBalanceInsightsFromHistory(
          combinedText,
          reflectionHistory.length
        );

        // Filter insights related to activated chakras if any are activated
        let filteredInsights = generatedInsights;
        if (activatedChakras && activatedChakras.length > 0) {
          filteredInsights = generatedInsights.filter(insight => 
            activatedChakras.includes(insight.chakraId)
          );
        }

        setInsights(filteredInsights);

        // Generate practice recommendations based on insights
        const chakraService = new ChakraActivationService();
        const practiceRecs = await chakraService.getRecommendedPractices(
          filteredInsights.map(i => i.chakraId)
        );
        
        setRecommendations(practiceRecs);
      } catch (err) {
        console.error('Error generating chakra balance insights:', err);
        setError('Failed to generate balance insights. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    generateBalanceInsights();
  }, [reflectionHistory, activatedChakras]);

  return {
    insights,
    recommendations,
    isLoading,
    error
  };
}
