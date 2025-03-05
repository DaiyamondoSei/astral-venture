
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
            cx={150} cy={380} 
            chakraIndex={0}
            showChakras={showChakras}
            showIllumination={showIllumination}
            showFractal={showFractal}
            showTranscendence={showTranscendence}
            showInfinity={showInfinity}
            baseProgressPercentage={baseProgressPercentage}
            intensity={getChakraIntensity(0)}
          />
          
          {/* Sacral Chakra */}
          <ChakraPoint 
            cx={150} cy={340} 
            chakraIndex={1}
            showChakras={showChakras}
            showIllumination={showIllumination}
            showFractal={showFractal}
            showTranscendence={showTranscendence}
            showInfinity={showInfinity}
            baseProgressPercentage={baseProgressPercentage}
            intensity={getChakraIntensity(1)}
          />
          
          {/* Solar Plexus Chakra */}
          <ChakraPoint 
            cx={150} cy={300} 
            chakraIndex={2}
            showChakras={showChakras}
            showIllumination={showIllumination}
            showFractal={showFractal}
            showTranscendence={showTranscendence}
            showInfinity={showInfinity}
            baseProgressPercentage={baseProgressPercentage}
            intensity={getChakraIntensity(2)}
          />
          
          {/* Heart Chakra */}
          <ChakraPoint 
            cx={150} cy={260} 
            chakraIndex={3}
            showChakras={showChakras}
            showIllumination={showIllumination}
            showFractal={showFractal}
            showTranscendence={showTranscendence}
            showInfinity={showInfinity}
            baseProgressPercentage={baseProgressPercentage}
            intensity={getChakraIntensity(3)}
          />
          
          {/* Throat Chakra */}
          <ChakraPoint 
            cx={150} cy={230} 
            chakraIndex={4}
            showChakras={showChakras}
            showIllumination={showIllumination}
            showFractal={showFractal}
            showTranscendence={showTranscendence}
            showInfinity={showInfinity}
            baseProgressPercentage={baseProgressPercentage}
            intensity={getChakraIntensity(4)}
          />
          
          {/* Third Eye Chakra */}
          <ChakraPoint 
            cx={150} cy={205} 
            chakraIndex={5}
            showChakras={showChakras}
            showIllumination={showIllumination}
            showFractal={showFractal}
            showTranscendence={showTranscendence}
            showInfinity={showInfinity}
            baseProgressPercentage={baseProgressPercentage}
            intensity={getChakraIntensity(5)}
          />
          
          {/* Crown Chakra */}
          <ChakraPoint 
            cx={150} cy={180} 
            chakraIndex={6}
            showChakras={showChakras}
            showIllumination={showIllumination}
            showFractal={showFractal}
            showTranscendence={showTranscendence}
            showInfinity={showInfinity}
            baseProgressPercentage={baseProgressPercentage}
            intensity={getChakraIntensity(6)}
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
