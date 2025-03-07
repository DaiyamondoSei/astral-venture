
import React from 'react';
import ChakraPoint from './chakra-point';
import { CHAKRA_POSITIONS } from '../types';

interface ChakraPointsProps {
  showChakras: boolean;
  showDetails: boolean;
  showIllumination: boolean;
  showFractal: boolean;
  showTranscendence: boolean;
  showInfinity: boolean;
  baseProgressPercentage: number;
  getChakraIntensity: (chakraIndex: number) => number;
  activatedChakras?: number[];
}

const ChakraPoints: React.FC<ChakraPointsProps> = ({
  showChakras,
  showDetails,
  showIllumination,
  showFractal,
  showTranscendence,
  showInfinity,
  baseProgressPercentage,
  getChakraIntensity,
  activatedChakras = []
}) => {
  if (!showChakras) return null;

  // Create array of 7 chakras (0-6)
  const chakraPositions = CHAKRA_POSITIONS || [
    { x: 150, y: 380 }, // Root
    { x: 150, y: 340 }, // Sacral
    { x: 150, y: 300 }, // Solar Plexus
    { x: 150, y: 260 }, // Heart
    { x: 150, y: 230 }, // Throat
    { x: 150, y: 205 }, // Third Eye
    { x: 150, y: 180 }  // Crown
  ];

  return (
    <>
      {chakraPositions.map((position, i) => {
        const intensity = getChakraIntensity(i);
        const isActivated = activatedChakras.includes(i);
        
        return (
          <ChakraPoint
            key={`chakra-${i}`}
            index={i}
            intensity={intensity}
            isActivated={isActivated}
            showDetails={showDetails}
            showIllumination={showIllumination}
            showFractal={showFractal}
            showTranscendence={showTranscendence}
            showInfinity={showInfinity}
            cx={position.x}
            cy={position.y}
            baseProgressPercentage={baseProgressPercentage}
          />
        );
      })}
    </>
  );
};

export default ChakraPoints;
