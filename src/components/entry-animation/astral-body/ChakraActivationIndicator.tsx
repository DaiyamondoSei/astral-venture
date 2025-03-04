
import React from 'react';
import { ChakraActivation } from './ChakraPoints';

interface ChakraActivationIndicatorProps {
  activatedCount: number;
  chakraNames: ChakraActivation;
}

const ChakraActivationIndicator: React.FC<ChakraActivationIndicatorProps> = ({ 
  activatedCount, 
  chakraNames 
}) => {
  if (activatedCount === 0) return null;
  
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center text-white/70 text-xs font-display">
      {activatedCount > 3 ? 
        `${activatedCount} Chakras Active` : 
        Object.entries(chakraNames)
          .filter(([_, active]) => active)
          .map(([chakra]) => chakra.charAt(0).toUpperCase() + chakra.slice(1))
          .join(', ') + ' Active'
      }
    </div>
  );
};

export default ChakraActivationIndicator;
