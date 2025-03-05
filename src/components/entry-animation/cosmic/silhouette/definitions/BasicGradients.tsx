
import React from 'react';

interface BasicGradientsProps {
  showDetails: boolean;
  showIllumination: boolean;
  showTranscendence: boolean;
  showInfinity: boolean;
}

const BasicGradients: React.FC<BasicGradientsProps> = ({
  showDetails,
  showIllumination,
  showTranscendence,
  showInfinity
}) => {
  return (
    <>
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
    </>
  );
};

export default BasicGradients;
