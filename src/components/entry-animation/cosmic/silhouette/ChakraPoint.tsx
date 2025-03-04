
import React from 'react';
import { ChakraPointProps } from './types';
import { getChakraColor } from './utils';

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
      fill={getChakraColor(showIllumination, showInfinity, showTranscendence, showFractal)}
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
