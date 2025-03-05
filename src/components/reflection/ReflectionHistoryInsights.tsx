
import React from 'react';
import { getChakraNames, getChakraColors, calculateChakraBalance } from '@/utils/emotion/chakraUtils';

interface ReflectionHistoryInsightsProps {
  data?: {
    activatedChakras?: number[];
    dominantEmotions?: string[];
    emotionalAnalysis?: any;
  };
  onOpenAiAssistant?: (reflectionId?: string, reflectionContent?: string) => void;
}

const ReflectionHistoryInsights: React.FC<ReflectionHistoryInsightsProps> = ({ 
  data = {},
  onOpenAiAssistant
}) => {
  const { 
    activatedChakras = [], 
    dominantEmotions = [],
    emotionalAnalysis = {}
  } = data;
  
  // Get chakra names from indices
  const chakraNames = getChakraNames(activatedChakras);
  const chakraColors = getChakraColors(activatedChakras);
  
  // Calculate chakra balance
  const balancePercentage = calculateChakraBalance(activatedChakras);
  const balanceText = 
    balancePercentage >= 0.8 ? "Excellent" :
    balancePercentage >= 0.6 ? "Good" :
    balancePercentage >= 0.4 ? "Moderate" :
    balancePercentage >= 0.2 ? "Developing" : "Beginning";
  
  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="text-white/70 text-sm mb-2">
        Your reflections have revealed these insights:
      </div>
      
      {chakraNames.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/80">Activated Energy Centers</h4>
          <div className="flex flex-wrap gap-2">
            {chakraNames.map((name, i) => (
              <span 
                key={i} 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${chakraColors[i]}25`, 
                  color: chakraColors[i],
                  border: `1px solid ${chakraColors[i]}50`
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {dominantEmotions.length > 0 && (
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
      )}
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white/80">Chakra Balance</h4>
        <div className="w-full bg-black/30 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full"
            style={{ width: `${balancePercentage * 100}%` }}
          />
        </div>
        <div className="text-xs text-white/60 flex justify-between">
          <span>Balance: {balanceText}</span>
          <span>{Math.round(balancePercentage * 100)}%</span>
        </div>
      </div>
      
      {Object.keys(emotionalAnalysis).length > 0 && (
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
      )}
    </div>
  );
};

export default ReflectionHistoryInsights;
