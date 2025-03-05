
import React, { useState, useEffect, useMemo } from 'react';
import HumanSilhouette from '@/components/entry-animation/cosmic/HumanSilhouette';
import { getChakraResonance, calculateChakraBalance } from '@/utils/emotion/chakra/intensity';
import { motion } from 'framer-motion';

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
  // Calculate overall chakra balance
  const chakraBalance = useMemo(() => 
    calculateChakraBalance(activatedChakras, getChakraIntensity),
    [activatedChakras, getChakraIntensity]
  );
  
  // Generate fluid resonance lines between chakras
  const [resonanceLines, setResonanceLines] = useState<{start: number, end: number, intensity: number}[]>([]);
  
  // Update resonance lines with organic motion
  useEffect(() => {
    const updateResonance = () => {
      if (activatedChakras.length <= 1) {
        setResonanceLines([]);
        return;
      }
      
      // Create lines between activated chakras
      const newLines = [];
      
      for (let i = 0; i < activatedChakras.length; i++) {
        for (let j = i + 1; j < activatedChakras.length; j++) {
          const chakra1 = activatedChakras[i];
          const chakra2 = activatedChakras[j];
          const resonance = getChakraResonance(chakra1, chakra2, activatedChakras);
          
          // Only show lines with significant resonance
          if (resonance > 0.3) {
            newLines.push({
              start: chakra1,
              end: chakra2,
              intensity: resonance
            });
          }
        }
      }
      
      setResonanceLines(newLines);
    };
    
    // Update initially
    updateResonance();
    
    // Set interval for fluid updates
    const interval = setInterval(updateResonance, 1000);
    return () => clearInterval(interval);
  }, [activatedChakras, getChakraIntensity]);
  
  // Calculate background glow based on emotional growth and balance
  const glowIntensity = useMemo(() => {
    return Math.min(0.4 + (emotionalGrowth / 100 * 0.3) + (chakraBalance * 0.2), 0.9);
  }, [emotionalGrowth, chakraBalance]);
  
  // Determine the visualization variant based on emotional growth
  const visualizationVariant = useMemo(() => {
    if (emotionalGrowth > 90) return "transcendent";
    if (emotionalGrowth > 70) return "awakened";
    if (emotionalGrowth > 50) return "illuminated";
    if (emotionalGrowth > 30) return "aware";
    return "beginning";
  }, [emotionalGrowth]);
  
  return (
    <motion.div 
      className="bg-black/20 rounded-lg relative min-h-[300px]"
      initial={{ opacity: 0.8 }}
      animate={{ 
        opacity: [0.8, 0.9, 0.8],
        background: `rgba(0, 0, 0, ${0.2 + (chakraBalance * 0.1)})`
      }}
      transition={{ 
        duration: 5, 
        repeat: Infinity,
        repeatType: "reverse" 
      }}
    >
      {/* Resonance connection visualization */}
      {resonanceLines.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* We'll implement this in the next iteration */}
        </div>
      )}
      
      {/* Background glow effect */}
      <motion.div 
        className="absolute inset-0 rounded-lg"
        animate={{
          boxShadow: `inset 0 0 ${20 + (emotionalGrowth / 10)}px rgba(138, 92, 246, ${glowIntensity})`
        }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Human silhouette with chakras */}
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
      
      {/* Dynamic consciousness state indicator */}
      {visualizationVariant !== "beginning" && (
        <motion.div 
          className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          {visualizationVariant === "aware" && "Conscious Awareness Awakening"}
          {visualizationVariant === "illuminated" && "Energy Field Illuminating"}
          {visualizationVariant === "awakened" && "Consciousness Expansion Unfolding"}
          {visualizationVariant === "transcendent" && "Transcendent Connection Activating"}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AstralSilhouetteVisualization;
