
import React from 'react';
import { useChakraBalanceInsights, ChakraInsight, PracticeRecommendation } from '@/components/reflection/insights/useChakraInsights';
import ChakraInsights from '@/components/reflection/insights/ChakraInsights';
import RecommendedPractices from '@/components/reflection/insights/RecommendedPractices';
import { HistoricalReflection } from './types';

interface ReflectionHistoryInsightsProps {
  reflectionHistory: HistoricalReflection[];
  activatedChakras: number[];
}

const ReflectionHistoryInsights: React.FC<ReflectionHistoryInsightsProps> = ({
  reflectionHistory,
  activatedChakras
}) => {
  const {
    insights,
    recommendations,
    isLoading,
    error
  } = useChakraBalanceInsights(reflectionHistory, activatedChakras);

  if (isLoading) {
    return (
      <div className="animate-pulse py-4">
        <div className="h-4 bg-quantum-100/10 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-quantum-100/10 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-quantum-100/10 rounded w-5/6 mb-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 py-4">
        <p>{error}</p>
      </div>
    );
  }

  if (!insights.length) {
    return (
      <div className="text-quantum-100/70 italic py-4">
        <p>Continue your reflection journey to unlock historical insights about your chakra balance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ChakraInsights insights={insights} />
      
      <RecommendedPractices recommendations={recommendations} />
    </div>
  );
};

export default ReflectionHistoryInsights;
