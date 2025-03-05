
import React from 'react';

interface GeometryPatternsProps {
  showFractal: boolean;
  showTranscendence: boolean;
  showInfinity: boolean;
}

const GeometryPatterns: React.FC<GeometryPatternsProps> = ({ 
  showFractal, 
  showTranscendence, 
  showInfinity 
}) => {
  if (!showFractal) return null;
  
  return (
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
  );
};

export default GeometryPatterns;
