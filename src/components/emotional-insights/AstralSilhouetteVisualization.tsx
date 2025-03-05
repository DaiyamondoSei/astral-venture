
import React, { useState, useEffect, useMemo } from 'react';
import HumanSilhouette from '@/components/entry-animation/cosmic/HumanSilhouette';
import { getChakraResonance, calculateChakraBalance } from '@/utils/emotion/chakra/intensity';
import { motion } from 'framer-motion';
import ResonanceLines from './visualization/ResonanceLines';
import BackgroundGlow from './visualization/BackgroundGlow';
import ConsciousnessIndicator from './visualization/ConsciousnessIndicator';
import { useEmotionalTransition } from '@/hooks/useEmotionalTransition';

interface AstralSilhouetteVisualizationProps {
  emotionalGrowth: number;
  getChakraIntensity: (chakraIndex: number) => number;
  activatedChakras: number[];
  dominantEmotions?: string[]; // Add dominant emotions for color variations
}

// Chakra position mapping for visualization (y-coordinates)
const CHAKRA_Y_POSITIONS = [380, 340, 300, 260, 230, 205, 180];

const AstralSilhouetteVisualization = ({
  emotionalGrowth,
  getChakraIntensity,
  activatedChakras,
  dominantEmotions = []
}: AstralSilhouetteVisualizationProps) => {
  // Calculate overall chakra balance
  const chakraBalance = useMemo(() => 
    calculateChakraBalance(activatedChakras, getChakraIntensity),
    [activatedChakras, getChakraIntensity]
  );
  
  // Smooth transitions for emotional growth
  const transitionedGrowth = useEmotionalTransition(emotionalGrowth);
  
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
          
          // Add subtle variation to resonance for organic movement
          const timeVariation = Math.sin(Date.now() / 5000 + (chakra1 * chakra2)) * 0.1;
          const adjustedResonance = Math.max(0, Math.min(1, resonance + timeVariation));
          
          // Only show lines with significant resonance
          if (adjustedResonance > 0.3) {
            newLines.push({
              start: chakra1,
              end: chakra2,
              intensity: adjustedResonance
            });
          }
        }
      }
      
      setResonanceLines(newLines);
    };
    
    // Update initially
    updateResonance();
    
    // Set interval for fluid updates - more frequent for smoother animation
    const interval = setInterval(updateResonance, 100);
    return () => clearInterval(interval);
  }, [activatedChakras, getChakraIntensity]);
  
  // Calculate background glow based on emotional growth and balance
  const glowIntensity = useMemo(() => {
    return Math.min(0.4 + (emotionalGrowth / 100 * 0.3) + (chakraBalance * 0.2), 0.9);
  }, [emotionalGrowth, chakraBalance]);
  
  // Determine the visualization variant based on emotional growth
  const visualizationVariant = useMemo(() => {
    if (transitionedGrowth > 90) return "transcendent";
    if (transitionedGrowth > 70) return "awakened";
    if (transitionedGrowth > 50) return "illuminated";
    if (transitionedGrowth > 30) return "aware";
    return "beginning";
  }, [transitionedGrowth]);
  
  // Calculate combined emotional intensity for resonance lines
  const emotionalIntensity = useMemo(() => {
    return (transitionedGrowth / 100) * (0.7 + chakraBalance * 0.3);
  }, [transitionedGrowth, chakraBalance]);
  
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
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    >
      {/* Enhanced resonance connection visualization */}
      <ResonanceLines 
        resonanceLines={resonanceLines} 
        chakraYPositions={CHAKRA_Y_POSITIONS}
        emotionalIntensity={emotionalIntensity}
      />
      
      {/* Enhanced background glow effect */}
      <BackgroundGlow 
        emotionalGrowth={emotionalGrowth} 
        glowIntensity={glowIntensity}
        dominantEmotions={dominantEmotions}
      />
      
      {/* Dynamic ambient particles for higher states */}
      {transitionedGrowth > 60 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: Math.floor(transitionedGrowth / 15) }, (_, i) => (
            <motion.div
              key={`ambient-particle-${i}`}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.4, 0],
                scale: [0, 1 + (transitionedGrowth / 100), 0],
                x: [0, (Math.random() - 0.5) * 20],
                y: [0, (Math.random() - 0.5) * 20],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
      
      {/* Human silhouette with chakras */}
      <HumanSilhouette
        showChakras={true}
        showDetails={transitionedGrowth > 30}
        showIllumination={transitionedGrowth > 50}
        showFractal={transitionedGrowth > 70}
        showTranscendence={transitionedGrowth > 90}
        showInfinity={transitionedGrowth > 95}
        baseProgressPercentage={transitionedGrowth / 100}
        getChakraIntensity={getChakraIntensity}
        activatedChakras={activatedChakras}
      />
      
      {/* Enhanced dynamic consciousness state indicator */}
      <ConsciousnessIndicator visualizationVariant={visualizationVariant} />
    </motion.div>
  );
};

export default AstralSilhouetteVisualization;
