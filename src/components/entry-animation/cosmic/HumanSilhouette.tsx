
import React from 'react';
import { CHAKRA_COLORS } from './types';
import SilhouettePath from './silhouette/SilhouettePath';
import CentralGlow from './silhouette/CentralGlow';
import ChakraPoint from './silhouette/ChakraPoint';
import InfinityEssence from './silhouette/InfinityEssence';
import Definitions from './silhouette/Definitions';

interface HumanSilhouetteProps {
  showChakras?: boolean;
  showDetails?: boolean;
  showIllumination?: boolean;
  showFractal?: boolean;
  showTranscendence?: boolean;
  showInfinity?: boolean;
  baseProgressPercentage?: number;
  getChakraIntensity?: (chakraIndex: number) => number;
  activatedChakras?: number[];
}

const HumanSilhouette: React.FC<HumanSilhouetteProps> = ({
  showChakras = false,
  showDetails = false,
  showIllumination = false,
  showFractal = false,
  showTranscendence = false,
  showInfinity = false,
  baseProgressPercentage = 0.5,
  getChakraIntensity = () => 0.5,
  activatedChakras = []
}) => {
  return (
    <svg viewBox="0 0 300 500" className="w-full h-full">
      <Definitions 
        showDetails={showDetails}
        showIllumination={showIllumination}
        showFractal={showFractal}
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
      />
      
      {/* Main Silhouette */}
      <SilhouettePath
        showDetails={showDetails}
        showIllumination={showIllumination}
        showFractal={showFractal}
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
        baseProgressPercentage={baseProgressPercentage}
      />
      
      {/* Central Glow */}
      <CentralGlow 
        baseProgressPercentage={baseProgressPercentage}
        showIllumination={showIllumination}
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
      />
      
      {/* Chakra energy points */}
      {showChakras && (
        <>
          {/* Root Chakra */}
          <ChakraPoint 
            index={0}
            cx={150} cy={380} 
            intensity={getChakraIntensity(0)}
            isActivated={activatedChakras.includes(0)}
            showDetails={showDetails}
            showIllumination={showIllumination}
          />
          
          {/* Sacral Chakra */}
          <ChakraPoint 
            index={1}
            cx={150} cy={340} 
            intensity={getChakraIntensity(1)}
            isActivated={activatedChakras.includes(1)}
            showDetails={showDetails}
            showIllumination={showIllumination}
          />
          
          {/* Solar Plexus Chakra */}
          <ChakraPoint 
            index={2}
            cx={150} cy={300} 
            intensity={getChakraIntensity(2)}
            isActivated={activatedChakras.includes(2)}
            showDetails={showDetails}
            showIllumination={showIllumination}
          />
          
          {/* Heart Chakra */}
          <ChakraPoint 
            index={3}
            cx={150} cy={260} 
            intensity={getChakraIntensity(3)}
            isActivated={activatedChakras.includes(3)}
            showDetails={showDetails}
            showIllumination={showIllumination}
          />
          
          {/* Throat Chakra */}
          <ChakraPoint 
            index={4}
            cx={150} cy={230} 
            intensity={getChakraIntensity(4)}
            isActivated={activatedChakras.includes(4)}
            showDetails={showDetails}
            showIllumination={showIllumination}
          />
          
          {/* Third Eye Chakra */}
          <ChakraPoint 
            index={5}
            cx={150} cy={205} 
            intensity={getChakraIntensity(5)}
            isActivated={activatedChakras.includes(5)}
            showDetails={showDetails}
            showIllumination={showIllumination}
          />
          
          {/* Crown Chakra */}
          <ChakraPoint 
            index={6}
            cx={150} cy={180} 
            intensity={getChakraIntensity(6)}
            isActivated={activatedChakras.includes(6)}
            showDetails={showDetails}
            showIllumination={showIllumination}
          />
        </>
      )}
      
      {/* Infinity essence for transcendence level */}
      {(showTranscendence || showInfinity) && (
        <InfinityEssence showInfinity={showInfinity} />
      )}
    </svg>
  );
};

export default HumanSilhouette;
