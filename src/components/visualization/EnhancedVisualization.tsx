
/**
 * Enhanced Visualization Component
 * 
 * A high-performance, feature-rich visualization component that renders
 * cosmic and chakra visualizations with adaptive performance optimization.
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useVisualizationConfig } from '@/hooks/useVisualizationConfig';
import { useChakraSystem } from '@/hooks/useChakraSystem';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { VisualizationProps } from '@/types/visualization/VisualSystemTypes';
import HumanSilhouette from '../entry-animation/cosmic/silhouette/HumanSilhouette';
import BackgroundStars from '../entry-animation/cosmic/BackgroundStars';
import FractalPatterns from '../entry-animation/cosmic/FractalPatterns';
import CosmicCircles from '../entry-animation/cosmic/CosmicCircles';
import { useVisualizationState } from '../entry-animation/cosmic/hooks/useVisualizationState';
import { useStarsEffect } from '../entry-animation/cosmic/hooks/useStarsEffect';
import { useFractalEffect } from '../entry-animation/cosmic/hooks/useFractalEffect';
import { useChakraIntensity } from '../entry-animation/cosmic/hooks/useChakraIntensity';

/**
 * Enhanced Visualization Component
 */
const EnhancedVisualization: React.FC<VisualizationProps> = ({
  system: systemProps,
  energyPoints = 0,
  activatedChakras = [],
  className,
  onVisualizationRendered,
  deviceCapability
}) => {
  // Get visualization configuration
  const { config, shouldUseSimplifiedUI } = useVisualizationConfig({
    initialConfig: systemProps,
    overrideDeviceCapability: deviceCapability
  });
  
  // Get chakra system
  const { system: chakraSystem, activeChakras } = useChakraSystem({
    energyPoints,
    activatedChakras
  });
  
  // Performance monitoring
  const { 
    startTiming, 
    endTiming, 
    setNodeRef,
    getMetrics
  } = usePerformanceMonitoring({
    componentName: 'EnhancedVisualization',
    trackRenderTime: true,
    trackSize: true
  });
  
  // Set up visualization state based on energy points
  const visualizationState = useVisualizationState({
    energyPoints,
    showDetailsOverride: config.visualStates.fractal.active,
    showIlluminationOverride: config.visualStates.illumination.active,
    showFractalOverride: config.visualStates.fractal.active,
    showTranscendenceOverride: config.visualStates.transcendence.active,
    showInfinityOverride: config.visualStates.infinity.active
  });
  
  // Generate background effects
  const stars = useStarsEffect(energyPoints, visualizationState);
  const fractalPoints = shouldUseSimplifiedUI ? [] : useFractalEffect(visualizationState);
  const getChakraIntensity = useChakraIntensity(energyPoints, activatedChakras);
  
  // Track render performance
  useEffect(() => {
    startTiming();
    return () => {
      endTiming();
      
      // Notify parent component that rendering is complete
      if (onVisualizationRendered) {
        onVisualizationRendered();
      }
    };
  }, [startTiming, endTiming, onVisualizationRendered]);
  
  // The main component render ref
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set the monitoring ref
  useEffect(() => {
    if (containerRef.current) {
      setNodeRef(containerRef.current);
    }
  }, [setNodeRef]);
  
  return (
    <motion.div 
      ref={containerRef}
      className={cn(
        "relative w-full aspect-[9/16] max-w-md mx-auto overflow-hidden rounded-xl bg-black",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background stars with adaptive complexity */}
      <BackgroundStars 
        stars={stars}
        showTranscendence={visualizationState.showTranscendence}
        showInfinity={visualizationState.showInfinity}
        showFractal={visualizationState.showFractal}
        showIllumination={visualizationState.showIllumination}
        baseProgressPercentage={visualizationState.baseProgressPercentage}
      />
      
      {/* Fractal patterns - conditionally rendered based on performance */}
      {!shouldUseSimplifiedUI && (
        <FractalPatterns 
          fractalPoints={fractalPoints}
          showFractal={visualizationState.showFractal}
          showInfinity={visualizationState.showInfinity}
          showTranscendence={visualizationState.showTranscendence}
          showIllumination={visualizationState.showIllumination}
        />
      )}
      
      {/* Cosmic circles with adaptive rendering */}
      <CosmicCircles 
        showAura={visualizationState.showAura}
        showFractal={visualizationState.showFractal}
        showTranscendence={visualizationState.showTranscendence}
        showDetails={visualizationState.showDetails}
        baseProgressPercentage={visualizationState.baseProgressPercentage}
        showIllumination={visualizationState.showIllumination}
      />
      
      {/* Human silhouette with chakra visualization */}
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
      
      {/* Overlay for debugging if in debug mode */}
      {config.performanceSettings.performanceMetrics && (
        <div className="absolute bottom-2 left-2 right-2 text-xs text-white/50 bg-black/30 p-1 rounded">
          <div>Energy: {energyPoints} | Chakras: {activatedChakras.length}</div>
          <div>Quantum coherence: {chakraSystem.quantumStates.coherence.overallCoherence.toFixed(2)}</div>
        </div>
      )}
    </motion.div>
  );
};

export default EnhancedVisualization;
