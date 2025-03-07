
import React from 'react';
import { PracticeRecommendation } from './useChakraInsights';

interface RecommendedPracticesProps {
  recommendations: PracticeRecommendation[];
}

const RecommendedPractices: React.FC<RecommendedPracticesProps> = ({ recommendations }) => {
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

export default RecommendedPractices;
