
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
      <Definitions />
      
      {/* Main Silhouette */}
      <SilhouettePath
        showDetails={showDetails}
        showIllumination={showIllumination}
      />
      
      {/* Central Glow */}
      <CentralGlow 
        baseProgressPercentage={baseProgressPercentage}
        showIllumination={showIllumination}
      />
      
      {/* Chakra energy points */}
      {showChakras && (
        <>
          {/* Root Chakra */}
          <ChakraPoint 
            cx={150} cy={380} 
            color={CHAKRA_COLORS[0]}
            intensity={getChakraIntensity(0)}
            active={activatedChakras.includes(0)}
            showDetails={showDetails}
          />
          
          {/* Sacral Chakra */}
          <ChakraPoint 
            cx={150} cy={340} 
            color={CHAKRA_COLORS[1]}
            intensity={getChakraIntensity(1)}
            active={activatedChakras.includes(1)}
            showDetails={showDetails}
          />
          
          {/* Solar Plexus Chakra */}
          <ChakraPoint 
            cx={150} cy={300} 
            color={CHAKRA_COLORS[2]}
            intensity={getChakraIntensity(2)}
            active={activatedChakras.includes(2)}
            showDetails={showDetails}
          />
          
          {/* Heart Chakra */}
          <ChakraPoint 
            cx={150} cy={260} 
            color={CHAKRA_COLORS[3]}
            intensity={getChakraIntensity(3)}
            active={activatedChakras.includes(3)}
            showDetails={showDetails}
          />
          
          {/* Throat Chakra */}
          <ChakraPoint 
            cx={150} cy={230} 
            color={CHAKRA_COLORS[4]}
            intensity={getChakraIntensity(4)}
            active={activatedChakras.includes(4)}
            showDetails={showDetails}
          />
          
          {/* Third Eye Chakra */}
          <ChakraPoint 
            cx={150} cy={205} 
            color={CHAKRA_COLORS[5]}
            intensity={getChakraIntensity(5)}
            active={activatedChakras.includes(5)}
            showDetails={showDetails}
          />
          
          {/* Crown Chakra */}
          <ChakraPoint 
            cx={150} cy={180} 
            color={CHAKRA_COLORS[6]}
            intensity={getChakraIntensity(6)}
            active={activatedChakras.includes(6)}
            showDetails={showDetails}
          />
        </>
      )}
      
      {/* Infinity essence for transcendence level */}
      {(showTranscendence || showInfinity) && (
        <InfinityEssence 
          baseProgressPercentage={baseProgressPercentage}
          showInfinity={showInfinity}
        />
      )}
    </svg>
  );
};

export default HumanSilhouette;
