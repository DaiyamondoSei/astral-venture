
import React from 'react';

interface EmotionalAnalysisGridProps {
  emotionalAnalysis: Record<string, any>;
}

const EmotionalAnalysisGrid: React.FC<EmotionalAnalysisGridProps> = ({ emotionalAnalysis = {} }) => {
  if (Object.keys(emotionalAnalysis).length === 0) return null;
  
  return (
    <div className="pt-2">
      <h4 className="text-sm font-medium text-white/80 mb-2">Emotional Intelligence</h4>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(emotionalAnalysis).map(([key, value]: [string, any]) => (
          <div key={key} className="bg-black/20 p-2 rounded">
            <div className="text-xs text-white/60 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="text-sm font-medium">
              {typeof value === 'number' ? `${Math.round(value * 100)}%` : String(value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmotionalAnalysisGrid;
