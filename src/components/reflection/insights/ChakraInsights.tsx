
import React from 'react';
import { getChakraNames, getChakraColors } from '@/utils/emotion/chakraUtils';
import { ChakraActivated, normalizeChakraData } from '@/utils/emotion/chakraTypes';

interface ChakraInsightsProps {
  activatedChakras?: ChakraActivated;
}

const ChakraInsights: React.FC<ChakraInsightsProps> = ({ activatedChakras }) => {
  const normalizedChakras = normalizeChakraData(activatedChakras);
  const chakraNames = getChakraNames(normalizedChakras);
  const chakraColors = getChakraColors(normalizedChakras);
  
  if (chakraNames.length === 0) return null;
  
  return (
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
  );
};

export default ChakraInsights;
