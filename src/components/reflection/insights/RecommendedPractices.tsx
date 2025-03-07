
import React from 'react';
import { PracticeRecommendation } from './useChakraInsights';
import { useComponentValidation } from '@/hooks/useComponentValidation';
import { documented } from '@/utils/componentDoc';
import { devLogger } from '@/utils/debugUtils';

interface RecommendedPracticesProps {
  recommendations: PracticeRecommendation[];
}

/**
 * Displays practice recommendations based on chakra analysis
 */
const RecommendedPractices: React.FC<RecommendedPracticesProps> = ({ recommendations }) => {
  // Validate props in development mode
  useComponentValidation('RecommendedPractices', { recommendations });
  
  // Track render count in development
  const renderCount = React.useRef(0);
  React.useEffect(() => {
    renderCount.current++;
    devLogger.info('RecommendedPractices', `Render count: ${renderCount.current}`);
  });

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-muted-foreground text-sm italic">
        No practice recommendations available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Recommended Practices</h3>
      <ul className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <li key={index} className="p-3 rounded-md bg-quantum-900/5 border border-quantum-500/10">
            <p className="font-medium text-sm">{recommendation.title}</p>
            <p className="text-sm mt-1 text-muted-foreground">{recommendation.description}</p>
            {recommendation.chakraIds && recommendation.chakraIds.length > 0 && (
              <div className="mt-2 flex gap-1.5">
                {recommendation.chakraIds.map(chakraId => (
                  <span 
                    key={chakraId} 
                    className="inline-block px-2 py-0.5 text-xs rounded-full bg-quantum-500/10 text-quantum-500"
                  >
                    Chakra {chakraId}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Register component documentation
export default documented(RecommendedPractices, {
  description: 'A component that displays recommended practices based on chakra analysis',
  props: {
    recommendations: {
      type: 'PracticeRecommendation[]',
      required: true,
      description: 'Array of practice recommendations to display',
      example: [{ 
        title: 'Heart Chakra Meditation',
        description: 'A 10-minute meditation focusing on opening and balancing the heart chakra',
        chakraIds: [3],
        priority: 'high'
      }]
    }
  },
  examples: [
    {
      name: 'Basic Usage',
      description: 'Basic usage with an array of recommendations',
      code: `
import { PracticeRecommendation } from './useChakraInsights';

const recommendations: PracticeRecommendation[] = [
  {
    title: 'Heart Chakra Meditation',
    description: 'A 10-minute meditation focusing on opening and balancing the heart chakra',
    chakraIds: [3],
    priority: 'high'
  }
];

<RecommendedPractices recommendations={recommendations} />
      `
    },
    {
      name: 'Empty State',
      description: 'How the component looks with no recommendations',
      code: `
<RecommendedPractices recommendations={[]} />
      `
    }
  ],
  notes: [
    'This component renders a list of practice recommendations with proper styling',
    'Each recommendation can have associated chakra IDs that will be displayed as tags',
    'If no recommendations are available, a placeholder message is shown'
  ]
});
