
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
      {/* Enhanced silhouette gradient with improved color harmony */}
      <linearGradient id="silhouetteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={showInfinity ? "rgba(200, 230, 255, 0.25)" : showTranscendence ? "rgba(160, 210, 255, 0.22)" : showIllumination ? "rgba(120, 230, 235, 0.2)" : "rgba(86, 189, 248, 0.15)"} />
        <stop offset="50%" stopColor={showDetails ? "rgba(86, 189, 248, 0.08)" : "rgba(86, 189, 248, 0.03)"} />
        <stop offset="100%" stopColor={showInfinity ? "rgba(200, 230, 255, 0.25)" : showTranscendence ? "rgba(160, 210, 255, 0.22)" : showIllumination ? "rgba(120, 230, 235, 0.2)" : "rgba(86, 189, 248, 0.15)"} />
      </linearGradient>
      
      {/* Improved center glow with better radial distribution */}
      {showDetails && (
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="60%" fx="50%" fy="50%">
          <stop offset="0%" stopColor={showInfinity ? "rgba(190, 215, 255, 0.6)" : showTranscendence ? "rgba(160, 195, 255, 0.5)" : "rgba(86, 189, 248, 0.4)"} />
          <stop offset="70%" stopColor={showInfinity ? "rgba(190, 215, 255, 0.3)" : showTranscendence ? "rgba(160, 195, 255, 0.2)" : "rgba(86, 189, 248, 0.15)"} />
          <stop offset="100%" stopColor="rgba(86, 189, 248, 0)" />
        </radialGradient>
      )}
      
      {/* Enhanced chakra gradient with improved color vibrancy */}
      {showIllumination && (
        <linearGradient id="chakraGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={showInfinity ? "rgba(200, 130, 255, 0.85)" : showTranscendence ? "rgba(180, 110, 255, 0.8)" : "rgba(147, 51, 234, 0.75)"} />
          <stop offset="50%" stopColor={showInfinity ? "rgba(130, 180, 255, 0.85)" : showTranscendence ? "rgba(110, 160, 255, 0.8)" : "rgba(59, 130, 246, 0.75)"} />
          <stop offset="100%" stopColor={showInfinity ? "rgba(255, 130, 200, 0.85)" : showTranscendence ? "rgba(255, 110, 190, 0.8)" : "rgba(236, 72, 153, 0.75)"} />
        </linearGradient>
      )}
      
      {/* Enhanced fractal pattern with more detail */}
      {showFractal && (
        <pattern id="fractalPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(140, 200, 255, 0.5)" strokeWidth="0.5" />
          <circle cx="10" cy="10" r="4" fill="none" stroke="rgba(160, 220, 255, 0.4)" strokeWidth="0.3" />
          <circle cx="10" cy="10" r="1" fill="rgba(180, 230, 255, 0.6)" />
          {/* Additional fractal elements for higher consciousness levels */}
          {showTranscendence && (
            <>
              <circle cx="5" cy="5" r="1.5" fill="none" stroke="rgba(200, 230, 255, 0.35)" strokeWidth="0.3" />
              <circle cx="15" cy="15" r="1.5" fill="none" stroke="rgba(200, 230, 255, 0.35)" strokeWidth="0.3" />
              <circle cx="5" cy="15" r="1.5" fill="none" stroke="rgba(200, 230, 255, 0.35)" strokeWidth="0.3" />
              <circle cx="15" cy="5" r="1.5" fill="none" stroke="rgba(200, 230, 255, 0.35)" strokeWidth="0.3" />
            </>
          )}
        </pattern>
      )}
      
      {/* Enhanced ethereal glow filter */}
      {showTranscendence && (
        <filter id="etherealGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feColorMatrix 
            in="blur" 
            type="matrix" 
            values="0 0 0 0 0.6 0 0 0 0 0.85 0 0 0 0 1 0 0 0 0.8 0"
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
            <stop offset="30%" stopColor="rgba(200, 230, 255, 0.8)" />
            <stop offset="70%" stopColor="rgba(160, 200, 255, 0.5)" />
            <stop offset="100%" stopColor="rgba(120, 160, 255, 0)" />
          </radialGradient>
        </>
      )}
      
      {/* Add chakra-specific glow gradients */}
      <radialGradient id="rootChakraGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#e11d48" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
      </radialGradient>
      
      <radialGradient id="sacralChakraGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#fb923c" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
      </radialGradient>
      
      <radialGradient id="solarChakraGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#facc15" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
      </radialGradient>
      
      <radialGradient id="heartChakraGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
      </radialGradient>
      
      <radialGradient id="throatChakraGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
      </radialGradient>
      
      <radialGradient id="thirdChakraGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
      </radialGradient>
      
      <radialGradient id="crownChakraGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
};

export default Definitions;
