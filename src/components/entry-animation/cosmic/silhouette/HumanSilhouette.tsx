
import React from 'react';
import ChakraPoint from './chakra-point';
import { CHAKRA_POSITIONS } from '../types';
import SilhouettePath from './SilhouettePath';
import CentralGlow from './CentralGlow';
import InfinityEssence from './InfinityEssence';
import Definitions from './Definitions';

interface HumanSilhouetteProps {
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

const HumanSilhouette: React.FC<HumanSilhouetteProps> = ({
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
    <svg className="w-full h-full" viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
      <Definitions 
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
      />
      
      {/* Human silhouette path with glowing effect */}
      <SilhouettePath 
        showIllumination={showIllumination}
        showFractal={showFractal}
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
        showDetails={showDetails}
        baseProgressPercentage={baseProgressPercentage}
      />
      
      {/* Chakra points - only render if showing chakras */}
      {showChakras && chakraPositions.map((position, i) => {
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
      
      {/* Central energy glow */}
      <CentralGlow 
        showIllumination={showIllumination}
        showTranscendence={showTranscendence}
        baseProgressPercentage={baseProgressPercentage}
      />
      
      {/* Infinity essence - highest state */}
      {showInfinity && (
        <InfinityEssence />
      )}
    </svg>
  );
};

export default HumanSilhouette;
