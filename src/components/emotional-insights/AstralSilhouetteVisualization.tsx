
import React, { useState, useEffect, useMemo } from 'react';
import HumanSilhouette from '@/components/entry-animation/cosmic/HumanSilhouette';
import { getChakraResonance, calculateChakraBalance } from '@/utils/emotion/chakra/intensity';
import { motion } from 'framer-motion';

interface AstralSilhouetteVisualizationProps {
  emotionalGrowth: number;
  getChakraIntensity: (chakraIndex: number) => number;
  activatedChakras: number[];
}

// Chakra position mapping for visualization (y-coordinates)
const CHAKRA_Y_POSITIONS = [380, 340, 300, 260, 230, 205, 180];

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
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="resonanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(138, 43, 226, 0.7)" />
                <stop offset="50%" stopColor="rgba(173, 216, 230, 0.7)" />
                <stop offset="100%" stopColor="rgba(138, 43, 226, 0.7)" />
              </linearGradient>
              
              {/* Create filters for glow effects */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {resonanceLines.map((line, index) => {
              // Get chakra positions
              const y1 = CHAKRA_Y_POSITIONS[line.start];
              const y2 = CHAKRA_Y_POSITIONS[line.end];
              const x = 150; // Center x-coordinate
              
              // Calculate control points for curved paths
              const midY = (y1 + y2) / 2;
              const distance = Math.abs(y1 - y2);
              const curveOffset = 20 + (distance * 0.3) * (index % 2 === 0 ? 1 : -1);
              
              return (
                <g key={`line-${line.start}-${line.end}`}>
                  {/* Animated flowing path */}
                  <motion.path
                    d={`M ${x} ${y1} Q ${x + curveOffset} ${midY}, ${x} ${y2}`}
                    stroke="url(#resonanceGradient)"
                    strokeWidth={(line.intensity * 3)}
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: line.intensity, 
                      opacity: line.intensity,
                      strokeWidth: [(line.intensity * 3), (line.intensity * 4), (line.intensity * 3)]
                    }}
                    transition={{ 
                      duration: 3 + (1 - line.intensity) * 2, 
                      repeat: Infinity, 
                      repeatType: "reverse",
                      ease: "easeInOut" 
                    }}
                  />
                  
                  {/* Energy particles flowing along the path */}
                  {[...Array(Math.ceil(line.intensity * 3))].map((_, i) => (
                    <motion.circle
                      key={`particle-${line.start}-${line.end}-${i}`}
                      r={1 + (line.intensity * 2)}
                      fill="white"
                      filter="url(#glow)"
                      initial={{ opacity: 0.7 }}
                      animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{
                        duration: 2 + (i * 0.5),
                        repeat: Infinity,
                        delay: i * 0.7
                      }}
                    >
                      <animateMotion
                        path={`M ${x} ${y1} Q ${x + curveOffset} ${midY}, ${x} ${y2}`}
                        dur={`${3 + i}s`}
                        repeatCount="indefinite"
                      />
                    </motion.circle>
                  ))}
                </g>
              );
            })}
          </svg>
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
