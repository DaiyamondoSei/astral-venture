
import { useState, useEffect } from 'react';
import { ChakraActivationService } from '@/services/chakra/ChakraActivationService';
import { ChakraInsightsService } from '@/services/chakra/ChakraInsightsService';
import { HistoricalReflection } from '../types';

// Create service instances
const chakraInsightsService = new ChakraInsightsService();
const chakraActivationService = new ChakraActivationService();

export interface ChakraInsight {
  message: string;
  type: 'balance' | 'imbalance' | 'progress' | 'pattern';
  chakraIds?: number[];
  severity?: 'info' | 'suggestion' | 'warning';
}

export interface PracticeRecommendation {
  title: string;
  description: string;
  chakraIds?: number[];
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  benefits?: string[];
}

interface UseChakraInsightsResult {
  insights: ChakraInsight[];
  isLoading: boolean;
  error: string | null;
}

interface UseChakraBalanceInsightsResult extends UseChakraInsightsResult {
  recommendations: PracticeRecommendation[];
}

/**
 * Hook to generate insights from a single reflection
 */
export const useChakraInsights = (
  reflectionContent: string,
  activatedChakras: number[]
): UseChakraInsightsResult => {
  const [insights, setInsights] = useState<ChakraInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reflectionContent || !activatedChakras.length) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock implementation until the actual service is available
      const generatedInsights: ChakraInsight[] = [
        {
          message: "Your reflection shows a strong Root chakra activation, indicating groundedness.",
          type: "balance",
          chakraIds: [1],
          severity: "info"
        },
        {
          message: "Consider practices to balance your Throat and Third Eye chakras.",
          type: "imbalance",
          chakraIds: [5, 6],
          severity: "suggestion"
        }
      ];
      
      setInsights(generatedInsights);
    } catch (err) {
      setError("Failed to generate chakra insights");
      console.error("Error in useChakraInsights:", err);
    } finally {
      setIsLoading(false);
    }
  }, [reflectionContent, activatedChakras]);

  return { insights, isLoading, error };
};

/**
 * Hook to generate insights from reflection history
 */
export const useChakraBalanceInsights = (
  reflectionHistory: HistoricalReflection[],
  activatedChakras: number[]
): UseChakraBalanceInsightsResult => {
  const [insights, setInsights] = useState<ChakraInsight[]>([]);
  const [recommendations, setRecommendations] = useState<PracticeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reflectionHistory.length || !activatedChakras.length) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock implementation until the actual service is available
      const generatedInsights: ChakraInsight[] = [
        {
          message: "Your reflections over time show strengthening of the Heart chakra.",
          type: "progress",
          chakraIds: [4],
          severity: "info"
        },
        {
          message: "There appears to be a pattern of Solar Plexus activation during challenging situations.",
          type: "pattern",
          chakraIds: [3],
          severity: "info"
        }
      ];
      
      const practiceRecommendations: PracticeRecommendation[] = [
        {
          title: "Throat Chakra Meditation",
          description: "A 10-minute guided meditation to help express yourself more clearly.",
          chakraIds: [5],
          duration: "10 minutes",
          difficulty: "beginner"
        },
        {
          title: "Grounding Exercise",
          description: "Connect with the earth to strengthen your Root chakra.",
          chakraIds: [1],
          duration: "15 minutes",
          difficulty: "beginner"
        }
      ];
      
      setInsights(generatedInsights);
      setRecommendations(practiceRecommendations);
    } catch (err) {
      setError("Failed to generate chakra balance insights");
      console.error("Error in useChakraBalanceInsights:", err);
    } finally {
      setIsLoading(false);
    }
  }, [reflectionHistory, activatedChakras]);

  return { insights, recommendations, isLoading, error };
};
