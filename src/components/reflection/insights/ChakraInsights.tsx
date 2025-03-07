
import React from 'react';
import { ChakraInsight } from './useChakraInsights';

interface ChakraInsightsProps {
  insights: ChakraInsight[];
}

const ChakraInsights: React.FC<ChakraInsightsProps> = ({ insights }) => {
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

export default ChakraInsights;
