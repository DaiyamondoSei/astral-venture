
import React from 'react';

interface ChakraPointProps {
  cx: number;
  cy: number;
  chakraIndex: number;
  showChakras: boolean;
  showIllumination: boolean;
  showInfinity: boolean;
  showTranscendence: boolean;
  showFractal: boolean;
  baseProgressPercentage: number;
  intensity: number;
}

const ChakraPoint: React.FC<ChakraPointProps> = ({
  cx,
  cy,
  chakraIndex,
  showChakras,
  showIllumination,
  showInfinity,
  showTranscendence,
  showFractal,
  baseProgressPercentage,
  intensity
}) => {
  const baseRadius = chakraIndex === 2 || chakraIndex === 5 ? 2.5 : 2;
  const animatedRadius = chakraIndex === 2 || chakraIndex === 5 ? 3 : 2.5;
  
  const getChakraColor = () => {
    const chakraColors = [
      "#FF0000", // Root - Red
      "#FF7F00", // Sacral - Orange
      "#FFFF00", // Solar Plexus - Yellow
      "#00FF00", // Heart - Green
      "#0000FF", // Throat - Blue
      "#4B0082", // Third Eye - Indigo
      "#9400D3"  // Crown - Violet
    ];
    
    return chakraColors[chakraIndex] || "#FFFFFF";
  };
  
  const chakraClasses = `energy-point ${
    chakraIndex === 0 ? 'crown-chakra' :
    chakraIndex === 1 ? 'throat-chakra' :
    chakraIndex === 2 ? 'heart-chakra' :
    chakraIndex === 3 ? 'solar-chakra' :
    chakraIndex === 4 ? 'sacral-chakra' :
    'root-chakra'
  }`;

  return (
    <circle 
      cx={cx} cy={cy} r={showChakras ? animatedRadius : baseRadius} 
      className={chakraClasses} 
      fill={getChakraColor()}
      opacity={intensity}
      filter={showInfinity ? "url(#cosmicRays)" : undefined}
    >
      {showChakras && (
        <animate 
          attributeName="r"
          values={`${baseRadius};${animatedRadius + baseProgressPercentage};${baseRadius}`}
          dur={`${3 + (chakraIndex * 0.3)}s`}
          repeatCount="indefinite"
        />
      )}
    </circle>
  );
};

export default ChakraPoint;
