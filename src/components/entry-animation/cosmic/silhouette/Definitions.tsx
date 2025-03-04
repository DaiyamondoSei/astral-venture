
import React from 'react';

interface DefinitionsProps {
  showDetails: boolean;
  showIllumination: boolean;
  showFractal: boolean;
  showTranscendence: boolean;
  showInfinity: boolean;
}

const Definitions: React.FC<DefinitionsProps> = ({
  showDetails,
  showIllumination,
  showFractal,
  showTranscendence,
  showInfinity
}) => {
  return (
    <defs>
      <linearGradient id="silhouetteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={showInfinity ? "rgba(180, 220, 255, 0.2)" : showTranscendence ? "rgba(140, 200, 255, 0.18)" : showIllumination ? "rgba(86, 219, 228, 0.15)" : "rgba(56, 189, 248, 0.1)"} />
        <stop offset="50%" stopColor={showDetails ? "rgba(56, 189, 248, 0.05)" : "rgba(56, 189, 248, 0)"} />
        <stop offset="100%" stopColor={showInfinity ? "rgba(180, 220, 255, 0.2)" : showTranscendence ? "rgba(140, 200, 255, 0.18)" : showIllumination ? "rgba(86, 219, 228, 0.15)" : "rgba(56, 189, 248, 0.1)"} />
      </linearGradient>
      
      {showDetails && (
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor={showInfinity ? "rgba(140, 180, 255, 0.5)" : showTranscendence ? "rgba(100, 150, 255, 0.4)" : "rgba(56, 189, 248, 0.3)"} />
          <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
        </radialGradient>
      )}
      
      {showIllumination && (
        <linearGradient id="chakraGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={showInfinity ? "rgba(180, 100, 255, 0.8)" : showTranscendence ? "rgba(160, 80, 255, 0.75)" : "rgba(147, 51, 234, 0.7)"} />
          <stop offset="50%" stopColor={showInfinity ? "rgba(100, 160, 255, 0.8)" : showTranscendence ? "rgba(80, 140, 255, 0.75)" : "rgba(59, 130, 246, 0.7)"} />
          <stop offset="100%" stopColor={showInfinity ? "rgba(255, 100, 180, 0.8)" : showTranscendence ? "rgba(255, 80, 170, 0.75)" : "rgba(236, 72, 153, 0.7)"} />
        </linearGradient>
      )}
      
      {showFractal && (
        <pattern id="fractalPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(100, 180, 255, 0.4)" strokeWidth="0.5" />
          <circle cx="10" cy="10" r="4" fill="none" stroke="rgba(120, 200, 255, 0.3)" strokeWidth="0.3" />
          <circle cx="10" cy="10" r="1" fill="rgba(140, 220, 255, 0.5)" />
        </pattern>
      )}
      
      {showTranscendence && (
        <filter id="etherealGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feColorMatrix 
            in="blur" 
            type="matrix" 
            values="0 0 0 0 0.5 0 0 0 0 0.8 0 0 0 0 1 0 0 0 0.7 0"
            result="coloredBlur" 
          />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      )}
      
      {showInfinity && (
        <>
          <filter id="cosmicRays">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feColorMatrix 
              in="blur" 
              type="matrix" 
              values="0 0 0 0 0.7 0 0 0 0 0.9 0 0 0 0 1 0 0 0 0.9 0"
              result="coloredBlur" 
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <radialGradient id="infiniteGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
            <stop offset="30%" stopColor="rgba(180, 220, 255, 0.7)" />
            <stop offset="70%" stopColor="rgba(140, 180, 255, 0.4)" />
            <stop offset="100%" stopColor="rgba(100, 140, 255, 0)" />
          </radialGradient>
        </>
      )}
    </defs>
  );
};

export default Definitions;
