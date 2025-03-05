
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import HumanSilhouette from '@/components/entry-animation/cosmic/HumanSilhouette';
import VisualizationGuide from '../VisualizationGuide';
import AmbientParticles from './AmbientParticles';
import ConsciousStateLabel from './ConsciousStateLabel';
import ResonanceLines from './ResonanceLines';
import BackgroundGlow from './BackgroundGlow';
import ConsciousnessIndicator from './ConsciousnessIndicator';
import useResonanceLines from './hooks/useResonanceLines';
import { useEmotionalTransition } from '@/hooks/useEmotionalTransition';

interface AstralSilhouetteVisualizationProps {
  emotionalGrowth: number;
  getChakraIntensity: (chakraIndex: number) => number;
  activatedChakras: number[];
  dominantEmotions?: string[];
}

const AstralSilhouetteVisualization = ({
  emotionalGrowth,
  getChakraIntensity,
  activatedChakras,
  dominantEmotions = []
}: AstralSilhouetteVisualizationProps) => {
  // Smooth transitions for emotional growth
  const transitionedGrowth = useEmotionalTransition(emotionalGrowth, {
    duration: 2000,
    easing: 'emotionalRise'
  });
  
  // Get resonance lines between chakras
  const resonanceLines = useResonanceLines(activatedChakras, getChakraIntensity);
  
  // Calculate background glow based on emotional growth and balance
  const glowIntensity = useMemo(() => {
    const chakraBalance = activatedChakras.length > 0 ? 
      activatedChakras.reduce((sum, index) => sum + getChakraIntensity(index), 0) / activatedChakras.length : 0;
    return Math.min(0.4 + (emotionalGrowth / 100 * 0.3) + (chakraBalance * 0.2), 0.9);
  }, [emotionalGrowth, activatedChakras, getChakraIntensity]);
  
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
    const chakraBalance = activatedChakras.length > 0 ? 
      activatedChakras.reduce((sum, index) => sum + getChakraIntensity(index), 0) / activatedChakras.length : 0;
    return (transitionedGrowth / 100) * (0.7 + chakraBalance * 0.3);
  }, [transitionedGrowth, activatedChakras, getChakraIntensity]);
  
  // Chakra Y positions for visualization
  const CHAKRA_Y_POSITIONS = [380, 340, 300, 260, 230, 205, 180];

  return (
    <motion.div 
      className="bg-black/30 rounded-lg relative min-h-[320px] border border-white/5 overflow-hidden"
      initial={{ opacity: 0.8 }}
      animate={{ 
        opacity: [0.8, 0.9, 0.8],
        background: `rgba(0, 0, 0, ${0.25 + (emotionalIntensity * 0.15)})`
      }}
      transition={{ 
        duration: 5, 
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
      aria-label="Astral Silhouette Visualization"
    >
      {/* Label for screen readers */}
      <span className="sr-only">
        Emotional visualization showing {activatedChakras.length} activated chakras 
        with a growth level of {Math.round(emotionalGrowth)}%
      </span>
      
      {/* Add the visualization guide component */}
      <VisualizationGuide emotionalGrowth={emotionalGrowth} />
      
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
        <AmbientParticles transitionedGrowth={transitionedGrowth} />
      )}
      
      {/* Human silhouette with chakras */}
      <div className="absolute inset-0 flex items-center justify-center">
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
      </div>
      
      {/* Current consciousness state indicator */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <ConsciousnessIndicator visualizationVariant={visualizationVariant} />
      </div>
      
      {/* Visualization level indicators for better user understanding */}
      <div className="absolute top-3 left-3 text-xs font-medium text-white/70">
        <ConsciousStateLabel visualizationVariant={visualizationVariant} />
      </div>
    </motion.div>
  );
};

export default AstralSilhouetteVisualization;
