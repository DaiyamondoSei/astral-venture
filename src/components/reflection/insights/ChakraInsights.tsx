
import React from 'react';
import { ChakraActivated } from '@/utils/emotion/chakraTypes';
import { useChakraInsights } from '@/hooks/useChakraInsights';
import PersonalizedInsightsList from './PersonalizedInsightsList';
import RecommendedPractices from './RecommendedPractices';

interface ChakraInsightsProps {
  activatedChakras?: ChakraActivated;
  dominantEmotions?: string[];
}

/**
 * Component that displays personalized chakra insights and practice recommendations
 */
const ChakraInsights: React.FC<ChakraInsightsProps> = ({
  activatedChakras,
  dominantEmotions = []
}) => {
  const {
    personalizedInsights,
    practiceRecommendations,
    loading
  } = useChakraInsights(activatedChakras, dominantEmotions);

  if (personalizedInsights.length === 0 && practiceRecommendations.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="space-y-4 mt-4">
      <PersonalizedInsightsList 
        insights={personalizedInsights}
        loading={loading}
      />
      
      <RecommendedPractices 
        practices={practiceRecommendations}
        loading={loading}
      />
    </div>
  );
};

export default ChakraInsights;
