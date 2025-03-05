
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
  
  // Scale size and opacity based on activation and details level
  const baseSize = isActivated ? 4 : 2;
  const size = showDetails ? baseSize + 1 : baseSize;
  
  // Adjust opacity based on activation and illumination
  const baseOpacity = isActivated ? 0.8 : 0.3;
  const opacity = showIllumination ? 
    Math.min(baseOpacity + 0.2, 1.0) : 
    baseOpacity;
  
  // Determine if we should show the glow effect
  const showGlow = showIllumination && isActivated;
  
  return (
    <g className="chakra-point">
      {/* Outer glow for activated chakras */}
      {showGlow && (
        <circle
          cx={cx}
          cy={cy}
          r={size + 3}
          fill={`url(#chakraGlow${index})`}
          opacity={intensity * 0.6}
        />
      )}
      
      {/* Main chakra circle */}
      <circle
        cx={cx}
        cy={cy}
        r={size}
        fill={color}
        opacity={opacity * intensity}
        className="chakra-circle"
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
