
import React from 'react';
import { ChakraInsight } from './useChakraInsights';
import { useComponentValidation } from '@/hooks/useComponentValidation';
import { documented } from '@/utils/componentDoc';
import { devLogger } from '@/utils/debugUtils';

interface ChakraInsightsProps {
  insights: ChakraInsight[];
}

/**
 * Displays chakra insights from reflection analysis
 */
const ChakraInsights: React.FC<ChakraInsightsProps> = ({ insights }) => {
  // Validate props in development mode
  useComponentValidation('ChakraInsights', { insights });
  
  // Log mount in development
  React.useEffect(() => {
    devLogger.info('ChakraInsights', 'Component mounted');
    
    return () => {
      devLogger.info('ChakraInsights', 'Component unmounted');
    };
  }, []);
  
  if (!insights || insights.length === 0) {
    return (
      <div className="text-muted-foreground text-sm italic">
        No chakra insights available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Chakra Balance Insights</h3>
      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <li key={index} className="p-3 rounded-md bg-quantum-900/5 border border-quantum-500/10">
            <p className="text-sm">{insight.message}</p>
            {insight.chakraIds && insight.chakraIds.length > 0 && (
              <div className="mt-2 flex gap-1.5">
                {insight.chakraIds.map(chakraId => (
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
export default documented(ChakraInsights, {
  description: 'A component that displays chakra insights from reflection analysis',
  props: {
    insights: {
      type: 'ChakraInsight[]',
      required: true,
      description: 'Array of chakra insights to display',
      example: [{ 
        message: 'Your heart chakra shows strong activity',
        chakraIds: [3],
        confidence: 0.8
      }]
    }
  },
  examples: [
    {
      name: 'Basic Usage',
      description: 'Basic usage with an array of insights',
      code: `
import { ChakraInsight } from './useChakraInsights';

const insights: ChakraInsight[] = [
  {
    message: 'Your heart chakra shows strong activity',
    chakraIds: [3],
    confidence: 0.8
  }
];

<ChakraInsights insights={insights} />
      `
    },
    {
      name: 'Empty State',
      description: 'How the component looks with no insights',
      code: `
<ChakraInsights insights={[]} />
      `
    }
  ],
  notes: [
    'This component renders a list of chakra insights with proper styling',
    'Each insight can have associated chakra IDs that will be displayed as tags',
    'If no insights are available, a placeholder message is shown'
  ]
});
