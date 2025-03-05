
import React from 'react';
import { CHAKRA_COLORS } from '../types';

interface ChakraPointProps {
  index: number;
  intensity: number;
  isActivated: boolean;
  showDetails: boolean;
  showIllumination: boolean;
  cx?: number;
  cy?: number;
  chakraIndex?: number;
  showChakras?: boolean;
  showFractal?: boolean;
  showTranscendence?: boolean; 
  showInfinity?: boolean;
  baseProgressPercentage?: number;
}

const ChakraPoint: React.FC<ChakraPointProps> = ({
  index,
  intensity,
  isActivated,
  showDetails,
  showIllumination,
  cx = 150,
  cy = 200
}) => {
  // Using CHAKRA_COLORS directly instead of relying on CHAKRA_POSITIONS
  const color = CHAKRA_COLORS[index];
  
  // Scale size and opacity based on activation, details level, and intensity
  const baseSize = isActivated ? 4 : 2;
  const intensityBonus = isActivated ? intensity * 2 : 0;
  const size = showDetails ? baseSize + 1 + intensityBonus : baseSize + intensityBonus;
  
  // Adjust opacity based on activation, illumination and intensity
  const baseOpacity = isActivated ? 0.8 : 0.3;
  const opacityBoost = showIllumination ? 0.2 : 0;
  const opacity = Math.min(baseOpacity + opacityBoost, 1.0) * (0.5 + intensity * 0.5);
  
  // Determine if we should show the glow effect
  const showGlow = showIllumination && isActivated;
  
  // Calculate pulse animation parameters based on intensity
  const pulseScale = 1 + (intensity * 0.3);
  const pulseDuration = 3 - (intensity * 1); // Faster pulse for higher intensity
  
  return (
    <g className="chakra-point">
      {/* Outer glow for activated chakras */}
      {showGlow && (
        <circle
          cx={cx}
          cy={cy}
          r={size + 3 + (intensity * 2)}
          fill={`url(#chakraGlow${index})`}
          opacity={intensity * 0.6}
          className={isActivated ? "animate-pulse-slow" : ""}
        />
      )}
      
      {/* Outer pulse effect for highly active chakras */}
      {isActivated && intensity > 0.7 && (
        <circle
          cx={cx}
          cy={cy}
          r={size + 6}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          opacity={0.4}
          style={{
            animation: `pulse ${pulseDuration}s infinite ease-in-out`,
            transformOrigin: `${cx}px ${cy}px`,
            transform: `scale(${pulseScale})`,
          }}
        />
      )}
      
      {/* Main chakra circle */}
      <circle
        cx={cx}
        cy={cy}
        r={size}
        fill={color}
        opacity={opacity}
        className={isActivated && intensity > 0.5 ? "chakra-circle-active" : "chakra-circle"}
      />
      
      {/* Inner detail for activated chakras */}
      {isActivated && showDetails && (
        <circle
          cx={cx}
          cy={cy}
          r={size / 2}
          fill="white"
          opacity={intensity * 0.7}
          className="chakra-inner"
        />
      )}
      
      {/* Energy rays for highly activated chakras with illumination */}
      {isActivated && showIllumination && intensity > 0.8 && (
        <>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line
              key={`ray-${index}-${i}`}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(angle * Math.PI / 180) * (size + 8 + intensity * 4)}
              y2={cy + Math.sin(angle * Math.PI / 180) * (size + 8 + intensity * 4)}
              stroke={color}
              strokeWidth="0.5"
              opacity={0.5 * intensity}
            />
          ))}
        </>
      )}
      
      {/* Define the glow gradient for each chakra */}
      <defs>
        <radialGradient id={`chakraGlow${index}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
    </g>
  );
};

export default ChakraPoint;
