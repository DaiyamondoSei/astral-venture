
import React from 'react';
import { useChakraBalanceInsights, ChakraInsight, PracticeRecommendation } from '@/components/reflection/insights/useChakraInsights';
import ChakraInsights from '@/components/reflection/insights/ChakraInsights';
import RecommendedPractices from '@/components/reflection/insights/RecommendedPractices';
import { HistoricalReflection } from './types';
import { documented } from '@/utils/componentDoc';
import { useComponentValidation } from '@/hooks/useComponentValidation';
import { devLogger, measure } from '@/utils/debugUtils';
import { createFlowTracker } from '@/utils/dataFlowTracker';

interface ReflectionHistoryInsightsProps {
  reflectionHistory: HistoricalReflection[];
  activatedChakras: number[];
}

// Create a flow tracker for this component
const flowTracker = createFlowTracker('ReflectionHistoryInsights');

/**
 * Displays insights based on historical reflection data and activated chakras
 */
const ReflectionHistoryInsights: React.FC<ReflectionHistoryInsightsProps> = ({
  reflectionHistory,
  activatedChakras
}) => {
  // Validate props
  useComponentValidation('ReflectionHistoryInsights', { reflectionHistory, activatedChakras });
  
  // Initialize flow tracking on mount
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      flowTracker.start('insights-generation', 'Generating insights from reflection history');
      flowTracker.track('insights-generation', 'Component mounted', { 
        reflectionCount: reflectionHistory.length,
        activatedChakras 
      });
    }
    
    return () => {
      if (process.env.NODE_ENV === 'development') {
        flowTracker.end('insights-generation');
      }
    };
  }, [reflectionHistory, activatedChakras]);

  // Start performance measurement
  React.useEffect(() => {
    measure.start('reflection-insights-render');
    
    return () => {
      measure.end('reflection-insights-render');
    };
  });

  const {
    insights,
    recommendations,
    isLoading,
    error
  } = useChakraBalanceInsights(reflectionHistory, activatedChakras);
  
  // Track data flow after insights generated
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !isLoading) {
      flowTracker.track('insights-generation', 'Insights generated', { 
        insightCount: insights.length,
        recommendationCount: recommendations.length,
        error 
      });
    }
  }, [insights, recommendations, isLoading, error]);

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
    devLogger.error('ReflectionHistoryInsights', error);
    
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

// Register component documentation
export default documented(ReflectionHistoryInsights, {
  description: 'A component that displays insights based on historical reflection data and activated chakras',
  props: {
    reflectionHistory: {
      type: 'HistoricalReflection[]',
      required: true,
      description: 'Array of historical reflection data to analyze'
    },
    activatedChakras: {
      type: 'number[]',
      required: true,
      description: 'Array of activated chakra IDs'
    }
  },
  examples: [
    {
      name: 'Basic Usage',
      description: 'Basic usage with reflection history and activated chakras',
      code: `
import { HistoricalReflection } from './types';

const reflectionHistory: HistoricalReflection[] = [
  {
    id: '1',
    content: 'Today I felt a deep connection with nature...',
    created_at: '2023-05-01T12:00:00Z',
    chakras_activated: [1, 4]
  }
];

const activatedChakras = [1, 3, 4];

<ReflectionHistoryInsights 
  reflectionHistory={reflectionHistory}
  activatedChakras={activatedChakras}
/>
      `
    }
  ],
  notes: [
    'This component analyzes reflection history to provide chakra balance insights',
    'Shows loading state during analysis and error state if something goes wrong',
    'Displays an empty state message when there are no insights available'
  ]
});
