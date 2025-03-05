
import React, { useState, useEffect } from 'react';
import BackgroundStars from './cosmic/BackgroundStars';
import FractalPatterns from './cosmic/FractalPatterns';
import CosmicCircles from './cosmic/CosmicCircles';
import TranscendenceEffect from './cosmic/TranscendenceEffect';
import ConstellationLines from './cosmic/ConstellationLines';
import HumanSilhouette from './cosmic/HumanSilhouette';
import CentralEffects from './cosmic/CentralEffects';
import ProgressIndicators from './cosmic/ProgressIndicators';
import { generateFractalPoints } from './cosmic/fractalGenerator';
import { ENERGY_THRESHOLDS } from './cosmic/types';

interface CosmicAstralBodyProps {
  energyPoints?: number;
  streakDays?: number;
  activatedChakras?: number[];
  // Add dev mode overrides
  showDetailsOverride?: boolean;
  showIlluminationOverride?: boolean;
  showFractalOverride?: boolean;
  showTranscendenceOverride?: boolean;
  showInfinityOverride?: boolean;
}

const CosmicAstralBody: React.FC<CosmicAstralBodyProps> = ({ 
  energyPoints = 0, 
  streakDays = 0,
  activatedChakras = [],
  showDetailsOverride,
  showIlluminationOverride,
  showFractalOverride,
  showTranscendenceOverride,
  showInfinityOverride
}) => {
  const [stars, setStars] = useState<{x: number, y: number, size: number, delay: number, duration: number}[]>([]);
  const [fractalPoints, setFractalPoints] = useState<{x: number, y: number, size: number, rotation: number}[]>([]);
  
  // Calculate base progress percentage for animations (max at 600 points)
  const baseProgressPercentage = Math.min(energyPoints / 600, 1);
  
  // Calculate logarithmic progress for "infinite" scaling - never reaches 1.0
  const infiniteProgress = Math.log10(energyPoints + 1) / Math.log10(10000);
  
  // Calculate fractal complexity - increases logarithmically
  const fractalComplexity = Math.min(Math.log10(energyPoints + 1) * 2, 10);
  
  // Determine which visual elements should be active
  // Allow dev mode to override the normal thresholds if override values are provided
  const showChakras = typeof showDetailsOverride !== 'undefined' ? showDetailsOverride 
    : energyPoints >= ENERGY_THRESHOLDS.CHAKRAS;
    
  const showAura = typeof showDetailsOverride !== 'undefined' ? showDetailsOverride 
    : energyPoints >= ENERGY_THRESHOLDS.AURA;
    
  const showConstellation = typeof showDetailsOverride !== 'undefined' ? showDetailsOverride 
    : energyPoints >= ENERGY_THRESHOLDS.CONSTELLATION;
    
  const showDetails = typeof showDetailsOverride !== 'undefined' 
    ? showDetailsOverride 
    : energyPoints >= ENERGY_THRESHOLDS.DETAILS;
    
  const showIllumination = typeof showIlluminationOverride !== 'undefined' 
    ? showIlluminationOverride 
    : energyPoints >= ENERGY_THRESHOLDS.ILLUMINATION;
    
  const showFractal = typeof showFractalOverride !== 'undefined' 
    ? showFractalOverride 
    : energyPoints >= ENERGY_THRESHOLDS.FRACTAL;
    
  const showTranscendence = typeof showTranscendenceOverride !== 'undefined' 
    ? showTranscendenceOverride 
    : energyPoints >= ENERGY_THRESHOLDS.TRANSCENDENCE;
    
  const showInfinity = typeof showInfinityOverride !== 'undefined' 
    ? showInfinityOverride 
    : energyPoints >= ENERGY_THRESHOLDS.INFINITY;
  
  // Calculate chakra intensity based on progress
  const getChakraIntensity = (chakraIndex: number) => {
    if (energyPoints < ENERGY_THRESHOLDS.CHAKRAS) return 0;
    
    // If chakra is in the activated list, show it at full intensity
    if (activatedChakras.includes(chakraIndex)) {
      return 1;
    }
    
    const chakraActivationPoints = 
      ENERGY_THRESHOLDS.CHAKRAS + (chakraIndex * 15);
      
    if (energyPoints < chakraActivationPoints) return 0.3;
    if (energyPoints < chakraActivationPoints + 50) return 0.6;
    return 1;
  };
  
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
    energyPoints, 
    showFractal, 
    showTranscendence, 
    showInfinity, 
    fractalComplexity, 
    infiniteProgress
  ]);

  return (
    <div className="relative w-full aspect-[9/16] max-w-md mx-auto overflow-hidden rounded-xl">
      {/* Background stars - more appear and shine brighter with progress */}
      <BackgroundStars 
        stars={stars}
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
        showFractal={showFractal}
        showIllumination={showIllumination}
        baseProgressPercentage={baseProgressPercentage}
      />
      
      {/* Fractal patterns - visible at higher energy levels */}
      <FractalPatterns 
        fractalPoints={fractalPoints}
        showFractal={showFractal}
        showInfinity={showInfinity}
        showTranscendence={showTranscendence}
        showIllumination={showIllumination}
      />
      
      {/* Cosmic Circles - more appear with higher energy */}
      <CosmicCircles 
        showAura={showAura}
        showFractal={showFractal}
        showTranscendence={showTranscendence}
        showDetails={showDetails}
        baseProgressPercentage={baseProgressPercentage}
        showIllumination={showIllumination}
      />
      
      {/* Transcendence Effect - only at highest levels */}
      <TranscendenceEffect 
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
      />
      
      {/* Constellation lines - more complex with progress */}
      <ConstellationLines 
        showConstellation={showConstellation}
        showDetails={showDetails}
        showIllumination={showIllumination}
        showFractal={showFractal}
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
        baseProgressPercentage={baseProgressPercentage}
      />
      
      {/* Human silhouette */}
      <HumanSilhouette 
        showChakras={showChakras}
        showDetails={showDetails}
        showIllumination={showIllumination}
        showFractal={showFractal}
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
        baseProgressPercentage={baseProgressPercentage}
        getChakraIntensity={getChakraIntensity}
        activatedChakras={activatedChakras}
      />
      
      {/* Central and pulsing effects */}
      <CentralEffects 
        showInfinity={showInfinity}
        showTranscendence={showTranscendence}
        showIllumination={showIllumination}
        baseProgressPercentage={baseProgressPercentage}
      />
      
      {/* Progress indicators */}
      <ProgressIndicators 
        energyPoints={energyPoints}
        showTranscendence={showTranscendence}
        showInfinity={showInfinity}
        streakDays={streakDays}
        activatedChakras={activatedChakras}
      />
    </div>
  );
};

export default CosmicAstralBody;
