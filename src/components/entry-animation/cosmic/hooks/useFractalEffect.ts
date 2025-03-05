
import { useState, useEffect } from 'react';
import { generateFractalPoints } from '../fractalGenerator';
import { VisualizationState } from '../types/energy-types';

export const useFractalEffect = (
  visualizationState: VisualizationState
) => {
  const [fractalPoints, setFractalPoints] = useState<{x: number, y: number, size: number, rotation: number}[]>([]);
  const { 
    showFractal, 
    showTranscendence, 
    showInfinity, 
    fractalComplexity, 
    infiniteProgress 
  } = visualizationState;
  
  useEffect(() => {
    // Update fractal patterns
    setFractalPoints(generateFractalPoints(
      showFractal, 
      showTranscendence, 
      showInfinity, 
      fractalComplexity, 
      infiniteProgress
    ));
    
    // Set interval to update fractal patterns for continuous animation
    if (showFractal) {
      const intervalId = setInterval(() => {
        setFractalPoints(generateFractalPoints(
          showFractal, 
          showTranscendence, 
          showInfinity, 
          fractalComplexity, 
          infiniteProgress
        ));
      }, showInfinity ? 100 : 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [
    showFractal, 
    showTranscendence, 
    showInfinity, 
    fractalComplexity, 
    infiniteProgress
  ]);

  return fractalPoints;
};
