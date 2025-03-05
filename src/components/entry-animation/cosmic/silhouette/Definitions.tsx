
import React from 'react';
import BasicGradients from './definitions/BasicGradients';
import GeometryPatterns from './definitions/GeometryPatterns';
import GlowFilters from './definitions/GlowFilters';
import ChakraDefinitions from './definitions/ChakraDefinitions';

interface DefinitionsProps {
  showDetails: boolean;
  showIllumination: boolean;
  showFractal: boolean;
  showTranscendence: boolean;
  showInfinity: boolean;
}

const Definitions: React.FC<DefinitionsProps> = ({
  showDetails,
  showIllumination,
  showFractal,
  showTranscendence,
  showInfinity
}) => {
  return (
    <defs>
      {/* Basic gradients for silhouette and general elements */}
      <BasicGradients 
        showDetails={showDetails}
        showIllumination={showIllumination}
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
      />
      
      {/* Fractal and geometric patterns */}
      <GeometryPatterns 
        showFractal={showFractal}
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
      />
      
      {/* Glow and special effect filters */}
      <GlowFilters 
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
      />
      
      {/* Chakra-specific definitions */}
      <ChakraDefinitions 
        showTranscendence={showTranscendence}
      />
    </defs>
  );
};

export default Definitions;
