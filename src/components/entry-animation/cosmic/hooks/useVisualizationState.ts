
import { useMemo } from 'react';
import { ENERGY_THRESHOLDS } from '../types';
import { EnergyProps, VisualizationState } from '../types/energy-types';

export const useVisualizationState = ({
  energyPoints = 0,
  showDetailsOverride,
  showIlluminationOverride,
  showFractalOverride,
  showTranscendenceOverride,
  showInfinityOverride
}: EnergyProps): VisualizationState => {
  // Calculate base progress percentage for animations (max at 600 points)
  const baseProgressPercentage = Math.min(energyPoints / 600, 1);
  
  // Calculate logarithmic progress for "infinite" scaling - never reaches 1.0
  const infiniteProgress = Math.log10(energyPoints + 1) / Math.log10(10000);
  
  // Calculate fractal complexity - increases logarithmically
  const fractalComplexity = Math.min(Math.log10(energyPoints + 1) * 2, 10);
  
  // Determine which visual elements should be active
  // Use dev mode to override the normal thresholds if override values are provided
  return useMemo(() => ({
    showChakras: typeof showDetailsOverride !== 'undefined' ? 
      showDetailsOverride : 
      energyPoints >= ENERGY_THRESHOLDS.CHAKRAS,
      
    showAura: typeof showDetailsOverride !== 'undefined' ? 
      showDetailsOverride : 
      energyPoints >= ENERGY_THRESHOLDS.AURA,
      
    showConstellation: typeof showDetailsOverride !== 'undefined' ? 
      showDetailsOverride : 
      energyPoints >= ENERGY_THRESHOLDS.CONSTELLATION,
      
    showDetails: typeof showDetailsOverride !== 'undefined' ? 
      showDetailsOverride : 
      energyPoints >= ENERGY_THRESHOLDS.DETAILS,
      
    showIllumination: typeof showIlluminationOverride !== 'undefined' ? 
      showIlluminationOverride : 
      energyPoints >= ENERGY_THRESHOLDS.ILLUMINATION,
      
    showFractal: typeof showFractalOverride !== 'undefined' ? 
      showFractalOverride : 
      energyPoints >= ENERGY_THRESHOLDS.FRACTAL,
      
    showTranscendence: typeof showTranscendenceOverride !== 'undefined' ? 
      showTranscendenceOverride : 
      energyPoints >= ENERGY_THRESHOLDS.TRANSCENDENCE,
      
    showInfinity: typeof showInfinityOverride !== 'undefined' ? 
      showInfinityOverride : 
      energyPoints >= ENERGY_THRESHOLDS.INFINITY,
      
    baseProgressPercentage,
    infiniteProgress,
    fractalComplexity,
  }), [
    energyPoints,
    showDetailsOverride,
    showIlluminationOverride,
    showFractalOverride,
    showTranscendenceOverride,
    showInfinityOverride,
    baseProgressPercentage,
    infiniteProgress,
    fractalComplexity
  ]);
};
