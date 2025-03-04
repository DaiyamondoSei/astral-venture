
import React from 'react';
import { ChakraActivation } from './ChakraPoints';

interface ChakraActivationIndicatorProps {
  activatedCount: number;
  chakraNames: ChakraActivation;
}

/**
 * ChakraActivationIndicator Component
 * 
 * Displays information about which chakras are currently activated in the
 * astral body visualization.
 * 
 * Provides both visual indication and semantic markup for screen readers.
 */
const ChakraActivationIndicator: React.FC<ChakraActivationIndicatorProps> = ({ 
  activatedCount, 
  chakraNames 
}) => {
  if (activatedCount === 0) return null;
  
  // For screen readers, provide detailed information about activated chakras
  const ariaDescription = Object.entries(chakraNames)
    .filter(([_, active]) => active)
    .map(([chakra]) => chakra.charAt(0).toUpperCase() + chakra.slice(1))
    .join(', ') + ' Chakras Active';
  
  // For visual display, use a simpler format
  const displayText = activatedCount > 3 ? 
    `${activatedCount} Chakras Active` : 
    Object.entries(chakraNames)
      .filter(([_, active]) => active)
      .map(([chakra]) => chakra.charAt(0).toUpperCase() + chakra.slice(1))
      .join(', ') + ' Active';
  
  return (
    <div 
      className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center text-white/70 text-xs font-display"
      aria-live="polite"
      role="status"
      aria-label={ariaDescription}
    >
      {displayText}
    </div>
  );
};

export default ChakraActivationIndicator;
