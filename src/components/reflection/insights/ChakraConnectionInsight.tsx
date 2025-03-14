
import React from 'react';
import { getChakraNames } from '@/utils/emotion/chakraUtils';
import { ChakraActivated, normalizeChakraData } from '@/utils/emotion/chakraTypes';

interface ChakraConnectionInsightProps {
  activatedChakras?: ChakraActivated;
}

const ChakraConnectionInsight: React.FC<ChakraConnectionInsightProps> = ({ activatedChakras }) => {
  const normalizedChakras = normalizeChakraData(activatedChakras);
  const chakraNames = getChakraNames(normalizedChakras);
  
  if (chakraNames.length < 2) return null;
  
  const insightText = getChakraConnectionInsight(chakraNames[0], chakraNames[1]);
  
  return (
    <div className="text-sm text-white/70">
      The connection between your {chakraNames[0]} and {chakraNames[1]} chakras indicates {insightText}.
    </div>
  );
};

function getChakraConnectionInsight(chakra1: string, chakra2: string): string {
  if ((chakra1 === 'Heart' && chakra2 === 'Throat') || 
      (chakra1 === 'Throat' && chakra2 === 'Heart')) {
    return 'a deepening connection between love and authentic expression';
  }
  
  if ((chakra1 === 'Third Eye' && chakra2 === 'Crown') || 
      (chakra1 === 'Crown' && chakra2 === 'Third Eye')) {
    return 'an awakening of higher spiritual awareness and intuition';
  }
  
  if ((chakra1 === 'Root' && chakra2 === 'Solar Plexus') || 
      (chakra1 === 'Solar Plexus' && chakra2 === 'Root')) {
    return 'a grounding of your personal power';
  }
  
  return 'a meaningful pattern in your energy system';
}

export default ChakraConnectionInsight;
