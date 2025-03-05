
import { useState, useEffect } from 'react';
import { VisualizationState } from '../types/energy-types';

export const useStarsEffect = (
  energyPoints: number,
  visualizationState: VisualizationState
) => {
  const [stars, setStars] = useState<{x: number, y: number, size: number, delay: number, duration: number}[]>([]);
  const { showTranscendence, showInfinity, showFractal } = visualizationState;
  
  useEffect(() => {
    // Generate more stars as energy increases - logarithmic scaling
    const baseStarCount = 50;
    const additionalStars = Math.floor(Math.log10(energyPoints + 1) * 100);
    const starCount = baseStarCount + additionalStars;
    const maxStars = 350;
    
    const randomStars = Array.from({ length: Math.min(starCount, maxStars) }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + (showTranscendence ? 2 : 1),
      delay: Math.random() * 5,
      duration: Math.random() * 3 + (showInfinity ? 1 : 2)
    }));
    
    setStars(randomStars);
  }, [energyPoints, showTranscendence, showInfinity, showFractal]);

  return stars;
};
