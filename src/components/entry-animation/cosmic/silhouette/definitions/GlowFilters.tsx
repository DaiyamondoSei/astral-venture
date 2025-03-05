
import React from 'react';

interface GlowFiltersProps {
  showTranscendence: boolean;
  showInfinity: boolean;
}

const GlowFilters: React.FC<GlowFiltersProps> = ({ 
  showTranscendence, 
  showInfinity 
}) => {
  return (
    <>
      {/* Enhanced ethereal glow filter */}
      {showTranscendence && (
        <filter id="etherealGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feColorMatrix 
            in="blur" 
            type="matrix" 
            values="0 0 0 0 0.7 0 0 0 0 0.9 0 0 0 0 1 0 0 0 0.8 0"
            result="coloredBlur" 
          />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      )}
      
      {/* Enhanced cosmic rays filter */}
      {showInfinity && (
        <>
          <filter id="cosmicRays">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feColorMatrix 
              in="blur" 
              type="matrix" 
              values="0 0 0 0 0.8 0 0 0 0 0.92 0 0 0 0 1 0 0 0 0.95 0"
              result="coloredBlur" 
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Enhanced infinite glow with better color distribution */}
          <radialGradient id="infiniteGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
            <stop offset="30%" stopColor="rgba(220, 240, 255, 0.8)" />
            <stop offset="70%" stopColor="rgba(180, 220, 255, 0.5)" />
            <stop offset="100%" stopColor="rgba(140, 180, 255, 0)" />
          </radialGradient>
        </>
      )}
    </>
  );
};

export default GlowFilters;
