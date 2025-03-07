
import React from 'react';
import SilhouettePath from './SilhouettePath';
import CentralGlow from './CentralGlow';
import InfinityEssence from './InfinityEssence';
import Definitions from './Definitions';
import ChakraPoints from './ChakraPoints';

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
  return (
    <svg className="w-full h-full" viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
      <Definitions 
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
        showDetails={showDetails}
        showIllumination={showIllumination}
        showFractal={showFractal}
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
      
      {/* Chakra points */}
      <ChakraPoints
        showChakras={showChakras}
        showDetails={showDetails}
        showIllumination={showIllumination}
        showFractal={showFractal}
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
        baseProgressPercentage={baseProgressPercentage}
        getChakraIntensity={getChakraIntensity}
        activatedChakras={activatedChakras}
      />
      
      {/* Central energy glow */}
      <CentralGlow 
        showIllumination={showIllumination}
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
        baseProgressPercentage={baseProgressPercentage}
      />
      
      {/* Infinity essence - highest state */}
      {showInfinity && (
        <InfinityEssence 
          showInfinity={showInfinity}
        />
      )}
    </svg>
  );
};

export default HumanSilhouette;
