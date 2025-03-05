
import React from 'react';
import { getChakraNames } from '@/utils/emotion/chakraUtils';
import { ChakraActivated, normalizeChakraData } from '@/utils/emotion/chakraTypes';

interface ChakraFocusInsightProps {
  activatedChakras?: ChakraActivated;
}

const ChakraFocusInsight: React.FC<ChakraFocusInsightProps> = ({ activatedChakras }) => {
  const normalizedChakras = normalizeChakraData(activatedChakras);
  const chakraNames = getChakraNames(normalizedChakras);
  
  if (chakraNames.length === 0) return null;
  
  const dominantChakra = chakraNames[0];
  const focusText = getChakraFocus(dominantChakra);
  
  return (
    <div className="text-sm text-white/70">
      Your {dominantChakra} chakra is currently the most active, suggesting a focus on {focusText}.
    </div>
  );
};

function getChakraFocus(chakra: string): string {
  const focuses = {
    'Root': 'stability and security',
    'Sacral': 'creativity and emotions',
    'Solar Plexus': 'personal power and confidence',
    'Heart': 'love and compassion',
    'Throat': 'communication and expression',
    'Third Eye': 'intuition and wisdom',
    'Crown': 'spiritual connection and higher consciousness'
  };
  
  return focuses[chakra as keyof typeof focuses] || 'energy balance';
}

export default ChakraFocusInsight;
