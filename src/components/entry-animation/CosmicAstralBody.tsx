
import React, { useMemo } from 'react';
import BackgroundStars from './cosmic/BackgroundStars';
import FractalPatterns from './cosmic/FractalPatterns';
import CosmicCircles from './cosmic/CosmicCircles';
import TranscendenceEffect from './cosmic/TranscendenceEffect';
import ConstellationLines from './cosmic/ConstellationLines';
import HumanSilhouette from './cosmic/silhouette/HumanSilhouette';
import CentralEffects from './cosmic/CentralEffects';
import ProgressIndicators from './cosmic/ProgressIndicators';
import { useVisualizationState } from './cosmic/hooks/useVisualizationState';
import { useStarsEffect } from './cosmic/hooks/useStarsEffect';
import { useFractalEffect } from './cosmic/hooks/useFractalEffect';
import { useChakraIntensity } from './cosmic/hooks/useChakraIntensity';
import { EnergyProps } from './cosmic/types/energy-types';
import { usePerformance } from '@/contexts/PerformanceContext';

const CosmicAstralBody: React.FC<EnergyProps> = ({
  energyPoints = 0, 
  streakDays = 0,
  activatedChakras = [],
  showDetailsOverride,
  showIlluminationOverride,
  showFractalOverride,
  showTranscendenceOverride,
  showInfinityOverride
}) => {
  const { isLowPerformance, enableComplexAnimations } = usePerformance();
  
  // Extract visualization state based on energy and overrides
  const visualizationState = useVisualizationState({
    energyPoints,
    showDetailsOverride,
    showIlluminationOverride,
    showFractalOverride,
    showTranscendenceOverride,
    showInfinityOverride
  });
  
  // Generate stars based on energy level
  const stars = useStarsEffect(energyPoints, visualizationState);
  
  // Generate fractal points for visualization - skip for low performance
  const fractalPoints = !isLowPerformance 
    ? useFractalEffect(visualizationState)
    : useMemo(() => [], []);
  
  // Get chakra intensity calculator
  const getChakraIntensity = useChakraIntensity(energyPoints, activatedChakras);

  // Optimize rendering for low performance devices
  const shouldRenderComplexEffects = enableComplexAnimations && !isLowPerformance;

  return (
    <div className="relative w-full aspect-[9/16] max-w-md mx-auto overflow-hidden rounded-xl">
      {/* Background stars - more appear and shine brighter with progress */}
      <BackgroundStars 
        stars={stars}
        showTranscendence={visualizationState.showTranscendence}
        showInfinity={visualizationState.showInfinity}
        showFractal={visualizationState.showFractal}
        showIllumination={visualizationState.showIllumination}
        baseProgressPercentage={visualizationState.baseProgressPercentage}
      />
      
      {/* Fractal patterns - visible at higher energy levels - skip for low performance */}
      {shouldRenderComplexEffects && (
        <FractalPatterns 
          fractalPoints={fractalPoints}
          showFractal={visualizationState.showFractal}
          showInfinity={visualizationState.showInfinity}
          showTranscendence={visualizationState.showTranscendence}
          showIllumination={visualizationState.showIllumination}
        />
      )}
      
      {/* Cosmic Circles - more appear with higher energy */}
      <CosmicCircles 
        showAura={visualizationState.showAura}
        showFractal={visualizationState.showFractal}
        showTranscendence={visualizationState.showTranscendence}
        showDetails={visualizationState.showDetails}
        baseProgressPercentage={visualizationState.baseProgressPercentage}
        showIllumination={visualizationState.showIllumination}
      />
      
      {/* Transcendence Effect - only at highest levels and skip for low performance */}
      {shouldRenderComplexEffects && (
        <TranscendenceEffect 
          showTranscendence={visualizationState.showTranscendence}
          showInfinity={visualizationState.showInfinity}
        />
      )}
      
      {/* Constellation lines - more complex with progress */}
      <ConstellationLines 
        showConstellation={visualizationState.showConstellation}
        showDetails={visualizationState.showDetails}
        showIllumination={visualizationState.showIllumination}
        showFractal={visualizationState.showFractal}
        showTranscendence={visualizationState.showTranscendence}
        showInfinity={visualizationState.showInfinity}
        baseProgressPercentage={visualizationState.baseProgressPercentage}
      />
      
      {/* Human silhouette */}
      <HumanSilhouette 
        showChakras={visualizationState.showChakras}
        showDetails={visualizationState.showDetails}
        showIllumination={visualizationState.showIllumination}
        showFractal={visualizationState.showFractal}
        showTranscendence={visualizationState.showTranscendence}
        showInfinity={visualizationState.showInfinity}
        baseProgressPercentage={visualizationState.baseProgressPercentage}
        getChakraIntensity={getChakraIntensity}
        activatedChakras={activatedChakras}
      />
      
      {/* Central and pulsing effects - skip some for low performance */}
      {shouldRenderComplexEffects && (
        <CentralEffects 
          showInfinity={visualizationState.showInfinity}
          showTranscendence={visualizationState.showTranscendence}
          showIllumination={visualizationState.showIllumination}
          baseProgressPercentage={visualizationState.baseProgressPercentage}
        />
      )}
      
      {/* Progress indicators */}
      <ProgressIndicators 
        energyPoints={energyPoints}
        showTranscendence={visualizationState.showTranscendence}
        showInfinity={visualizationState.showInfinity}
        streakDays={streakDays}
        activatedChakras={activatedChakras}
      />
    </div>
  );
};

export default React.memo(CosmicAstralBody);
