
import React from 'react';
import { calculateChakraBalance } from '@/utils/emotion/chakraUtils';
import { ChakraActivated, normalizeChakraData } from '@/utils/emotion/chakraTypes';

interface ChakraBalanceIndicatorProps {
  activatedChakras?: ChakraActivated;
}

const ChakraBalanceIndicator: React.FC<ChakraBalanceIndicatorProps> = ({ activatedChakras }) => {
  const normalizedChakras = normalizeChakraData(activatedChakras);
  const balancePercentage = calculateChakraBalance(normalizedChakras);
  
  const balanceText = 
    balancePercentage >= 0.8 ? "Excellent" :
    balancePercentage >= 0.6 ? "Good" :
    balancePercentage >= 0.4 ? "Moderate" :
    balancePercentage >= 0.2 ? "Developing" : "Beginning";
  
  return (
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
  );
};

export default ChakraBalanceIndicator;
