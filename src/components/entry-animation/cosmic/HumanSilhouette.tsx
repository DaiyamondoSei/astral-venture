
import React from 'react';
import { motion } from 'framer-motion';
import { SilhouetteProps } from './silhouette/types';
import Definitions from './silhouette/Definitions';
import SilhouettePath from './silhouette/SilhouettePath';
import ChakraPoint from './silhouette/ChakraPoint';
import InfinityEssence from './silhouette/InfinityEssence';
import CentralGlow from './silhouette/CentralGlow';

const HumanSilhouette: React.FC<SilhouetteProps> = ({
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
  // Define chakra positions
  const chakraPoints = [
    { cx: 50, cy: 16, index: 0 },  // Crown
    { cx: 50, cy: 32, index: 1 },  // Throat
    { cx: 50, cy: 55, index: 2 },  // Heart
    { cx: 50, cy: 70, index: 3 },  // Solar
    { cx: 50, cy: 85, index: 4 },  // Sacral
    { cx: 50, cy: 100, index: 5 }, // Root
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="relative h-4/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <svg 
          className="h-full mx-auto astral-body-silhouette"
          viewBox="0 0 100 220" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <Definitions 
            showDetails={showDetails}
            showIllumination={showIllumination}
            showFractal={showFractal}
            showTranscendence={showTranscendence}
            showInfinity={showInfinity}
          />
          
          <SilhouettePath 
            showInfinity={showInfinity}
            showTranscendence={showTranscendence}
            showIllumination={showIllumination}
            showFractal={showFractal}
            showDetails={showDetails}
            baseProgressPercentage={baseProgressPercentage}
          />
          
          {/* Chakra energy points */}
          {chakraPoints.map((point) => (
            <ChakraPoint 
              key={`chakra-${point.index}`}
              cx={point.cx}
              cy={point.cy}
              chakraIndex={point.index}
              showChakras={showChakras}
              showIllumination={showIllumination}
              showInfinity={showInfinity}
              showTranscendence={showTranscendence}
              showFractal={showFractal}
              baseProgressPercentage={baseProgressPercentage}
              intensity={getChakraIntensity(point.index)}
            />
          ))}
          
          {/* Infinity level core essence */}
          <InfinityEssence showInfinity={showInfinity} />
        </svg>
        
        {/* Central glow behind the silhouette */}
        <CentralGlow 
          showInfinity={showInfinity}
          showTranscendence={showTranscendence}
          showIllumination={showIllumination}
          baseProgressPercentage={baseProgressPercentage}
        />
      </motion.div>
    </div>
  );
};

export default HumanSilhouette;
