
import React from 'react';
import { CHAKRA_COLORS } from '../types';

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
          <stop offset="0%" stopColor={showInfinity ? "rgba(220, 235, 255, 0.7)" : showTranscendence ? "rgba(190, 220, 255, 0.6)" : "rgba(130, 210, 255, 0.5)"} />
          <stop offset="70%" stopColor={showInfinity ? "rgba(190, 215, 255, 0.3)" : showTranscendence ? "rgba(160, 195, 255, 0.2)" : "rgba(86, 189, 248, 0.15)"} />
          <stop offset="100%" stopColor="rgba(86, 189, 248, 0)" />
        </radialGradient>
      )}
      
      {/* Enhanced chakra gradient with improved color vibrancy */}
      {showIllumination && (
        <linearGradient id="chakraGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={showInfinity ? "rgba(230, 180, 255, 0.9)" : showTranscendence ? "rgba(200, 150, 255, 0.85)" : "rgba(180, 130, 255, 0.8)"} />
          <stop offset="50%" stopColor={showInfinity ? "rgba(160, 210, 255, 0.9)" : showTranscendence ? "rgba(140, 190, 255, 0.85)" : "rgba(110, 170, 250, 0.8)"} />
          <stop offset="100%" stopColor={showInfinity ? "rgba(255, 180, 220, 0.9)" : showTranscendence ? "rgba(255, 150, 200, 0.85)" : "rgba(255, 120, 180, 0.8)"} />
        </linearGradient>
      )}
      
      {/* Enhanced fractal pattern with more intricate detail */}
      {showFractal && (
        <pattern id="fractalPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="20" height="20" fill="rgba(20, 30, 50, 0.2)" />
          <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(140, 200, 255, 0.5)" strokeWidth="0.5" />
          <circle cx="10" cy="10" r="4" fill="none" stroke="rgba(160, 220, 255, 0.4)" strokeWidth="0.3" />
          <circle cx="10" cy="10" r="1" fill="rgba(180, 230, 255, 0.6)" />
          
          {/* Sacred geometry overlays */}
          <path d="M3,10 L17,10 M10,3 L10,17" stroke="rgba(200, 230, 255, 0.3)" strokeWidth="0.2" />
          <path d="M5,5 L15,15 M5,15 L15,5" stroke="rgba(200, 230, 255, 0.25)" strokeWidth="0.2" />
          
          {/* Additional fractal elements for higher consciousness levels */}
          {showTranscendence && (
            <>
              <circle cx="5" cy="5" r="1.5" fill="none" stroke="rgba(200, 230, 255, 0.35)" strokeWidth="0.3" />
              <circle cx="15" cy="15" r="1.5" fill="none" stroke="rgba(200, 230, 255, 0.35)" strokeWidth="0.3" />
              <circle cx="5" cy="15" r="1.5" fill="none" stroke="rgba(200, 230, 255, 0.35)" strokeWidth="0.3" />
              <circle cx="15" cy="5" r="1.5" fill="none" stroke="rgba(200, 230, 255, 0.35)" strokeWidth="0.3" />
              <path d="M2,10 C2,5.582 5.582,2 10,2 C14.418,2 18,5.582 18,10 C18,14.418 14.418,18 10,18 C5.582,18 2,14.418 2,10 Z" 
                fill="none" stroke="rgba(200, 230, 255, 0.2)" strokeWidth="0.2" />
            </>
          )}
          
          {/* Infinity level adds more complex sacred geometry */}
          {showInfinity && (
            <>
              <path d="M10,2 L18,18 L2,18 Z" fill="none" stroke="rgba(220, 240, 255, 0.2)" strokeWidth="0.2" />
              <path d="M2,2 L18,2 L18,18 L2,18 Z" fill="none" stroke="rgba(220, 240, 255, 0.15)" strokeWidth="0.2" />
              <path d="M10,2 C6,6 14,14 10,18 C14,14 6,6 10,2 Z" fill="none" stroke="rgba(220, 240, 255, 0.25)" strokeWidth="0.2" />
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
    </defs>
  );
};

export default Definitions;
