
import React from 'react';
import HumanSilhouette from '@/components/entry-animation/cosmic/HumanSilhouette';

interface AstralSilhouetteVisualizationProps {
  emotionalGrowth: number;
  getChakraIntensity: (chakraIndex: number) => number;
  activatedChakras: number[];
}

const AstralSilhouetteVisualization = ({
  emotionalGrowth,
  getChakraIntensity,
  activatedChakras
}: AstralSilhouetteVisualizationProps) => {
  return (
    <div className="bg-black/20 rounded-lg relative min-h-[300px]">
      <HumanSilhouette
        showChakras={true}
        showDetails={emotionalGrowth > 30}
        showIllumination={emotionalGrowth > 50}
        showFractal={emotionalGrowth > 70}
        showTranscendence={emotionalGrowth > 90}
        showInfinity={emotionalGrowth > 95}
        baseProgressPercentage={emotionalGrowth / 100}
        getChakraIntensity={getChakraIntensity}
        activatedChakras={activatedChakras}
      />
    </div>
  );
};

export default AstralSilhouetteVisualization;
