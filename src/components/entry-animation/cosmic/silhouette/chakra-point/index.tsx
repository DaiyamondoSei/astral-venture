
import React from 'react';
import ChakraBase from './ChakraBase';
import ChakraGlow from './ChakraGlow';
import ChakraRays from './ChakraRays';
import ChakraTranscendence from './ChakraTranscendence';
import ChakraInfinity from './ChakraInfinity';
import { CHAKRA_COLORS } from '../../types';

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

/**
 * ChakraPoint component that visualizes an individual chakra
 * 
 * This is the main component that combines all the chakra visualization elements
 */
const ChakraPoint: React.FC<ChakraPointProps> = ({
  index,
  intensity,
  isActivated,
  showDetails,
  showIllumination,
  cx = 150,
  cy = 200,
  showFractal = false,
  showTranscendence = false,
  showInfinity = false,
  baseProgressPercentage = 1
}) => {
  // Using CHAKRA_COLORS directly instead of relying on CHAKRA_POSITIONS
  const color = CHAKRA_COLORS[index];
  
  // Scale size and opacity based on activation, details level, and intensity
  const baseSize = isActivated ? 4 : 2;
  const intensityBonus = isActivated ? intensity * 3 : 0;
  const size = showDetails ? baseSize + 1.5 + intensityBonus : baseSize + intensityBonus;
  
  // Get chakra name for accessibility
  const chakraNames = [
    "Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"
  ];
  const chakraName = chakraNames[index] || `Chakra ${index + 1}`;
  
  return (
    <g className="chakra-point" aria-label={`${chakraName} chakra${isActivated ? ' active' : ' inactive'}`}>
      {/* Enhanced chakra glows with layered effects for higher consciousness states */}
      <ChakraTranscendence 
        cx={cx}
        cy={cy}
        size={size}
        color={color}
        intensity={intensity}
        isActivated={isActivated}
        showTranscendence={showTranscendence}
        baseProgressPercentage={baseProgressPercentage}
        index={index}
      />
      
      {/* Enhanced outer glow for activated chakras */}
      <ChakraGlow 
        cx={cx}
        cy={cy}
        size={size}
        color={color}
        intensity={intensity}
        isActivated={isActivated}
        showIllumination={showIllumination}
        baseProgressPercentage={baseProgressPercentage}
        index={index}
      />
      
      {/* Main chakra circle with improved animation */}
      <ChakraBase 
        cx={cx}
        cy={cy}
        size={size}
        color={color}
        intensity={intensity}
        isActivated={isActivated}
        index={index}
        baseProgressPercentage={baseProgressPercentage}
      />
      
      {/* Enhanced energy rays for highly activated chakras with illumination */}
      <ChakraRays 
        cx={cx}
        cy={cy}
        size={size}
        color={color}
        intensity={intensity}
        isActivated={isActivated}
        showIllumination={showIllumination}
        index={index}
      />
      
      {/* Add enhanced effects for infinity level chakras */}
      <ChakraInfinity 
        cx={cx}
        cy={cy}
        size={size}
        color={color}
        intensity={intensity}
        isActivated={isActivated}
        showInfinity={showInfinity}
        index={index}
      />
    </g>
  );
};

export default ChakraPoint;
