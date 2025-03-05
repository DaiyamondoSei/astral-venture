
import React from 'react';

interface EmotionInsightsProps {
  dominantEmotions?: string[];
}

const EmotionInsights: React.FC<EmotionInsightsProps> = ({ dominantEmotions = [] }) => {
  if (dominantEmotions.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-white/80">Dominant Energies</h4>
      <div className="flex flex-wrap gap-2">
        {dominantEmotions.map((emotion, i) => (
          <span 
            key={i} 
            className="px-2 py-1 rounded-full text-xs font-medium bg-quantum-500/10 text-quantum-300 border border-quantum-500/20"
          >
            {emotion}
          </span>
        ))}
      </div>
    </div>
  );
};

export default EmotionInsights;
