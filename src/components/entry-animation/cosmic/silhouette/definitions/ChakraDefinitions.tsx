
import React from 'react';
import { CHAKRA_COLORS } from '../../types';

interface ChakraDefinitionsProps {
  showTranscendence: boolean;
}

const ChakraDefinitions: React.FC<ChakraDefinitionsProps> = ({ showTranscendence }) => {
  return (
    <>
      {/* Add chakra-specific glow gradients with enhanced colors */}
      {CHAKRA_COLORS.map((color, index) => (
        <radialGradient 
          key={`chakraGlow${index}`}
          id={`chakraGlow${index}`} 
          cx="50%" 
          cy="50%" 
          r="50%" 
          fx="50%" 
          fy="50%"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="70%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      ))}
      
      {/* Special energy connection gradients */}
      <linearGradient id="energyConnectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
        <stop offset="50%" stopColor="rgba(255, 255, 255, 0.8)" />
        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
      </linearGradient>
      
      {/* Shimmer effect for transcendence */}
      {showTranscendence && (
        <filter id="shimmerEffect">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      )}
    </>
  );
};

export default ChakraDefinitions;
