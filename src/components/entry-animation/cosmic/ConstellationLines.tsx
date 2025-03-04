
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { EnergyLevelProps } from './types';

interface ConstellationLinesProps extends Pick<EnergyLevelProps, 'showConstellation' | 'showDetails' | 'showIllumination' | 'showFractal' | 'showTranscendence' | 'showInfinity' | 'baseProgressPercentage'> {}

const ConstellationLines: React.FC<ConstellationLinesProps> = ({ 
  showConstellation, 
  showDetails, 
  showIllumination,
  showFractal, 
  showTranscendence,
  showInfinity,
  baseProgressPercentage
}) => {
  // Memoize complex SVG paths for better performance
  const constellationPaths = useMemo(() => {
    // Base constellation paths
    const basePaths = [
      "M20,30 L35,40 L50,35 L65,45 L80,30",
      "M25,50 L40,55 L50,50 L60,55 L75,50",
      "M20,70 L35,60 L50,65 L65,55 L80,70",
      "M50,20 L50,80"
    ];
    
    // Additional constellation paths that appear with higher energy
    const advancedPaths = showConstellation ? [
      "M30,20 L40,30 L50,35 L60,30 L70,20",
      "M20,40 L30,45 L40,42 L50,45 L60,42 L70,45 L80,40"
    ] : [];
    
    // Detailed constellation paths
    const detailedPaths = showDetails ? [
      "M25,25 L35,35 L45,30 L55,35 L65,30 L75,25",
      "M25,75 L35,65 L45,70 L55,65 L65,70 L75,75",
      "M40,20 L40,80",
      "M60,20 L60,80"
    ] : [];
    
    // Fractal constellation paths
    const fractalPaths = showFractal ? [
      "M30,30 Q50,10 70,30 T50,50 30,70 Q50,90 70,70 T50,50 30,30",
      "M40,40 Q50,20 60,40 T50,60 40,60 Q50,80 60,60 T50,40 40,40"
    ] : [];
    
    // Transcendence level paths - more spiritual and complex
    const transcendencePaths = showTranscendence ? [
      "M10,50 Q30,20 50,10 T70,20 90,50 Q70,80 50,90 T30,80 10,50",
      "M30,30 Q50,10 70,30 Q90,50 70,70 Q50,90 30,70 Q10,50 30,30",
      "M50,10 Q70,30 90,50 Q70,70 50,90 Q30,70 10,50 Q30,30 50,10"
    ] : [];
    
    // Combine all paths based on energy level
    return [...basePaths, ...advancedPaths, ...detailedPaths, ...fractalPaths, ...transcendencePaths];
  }, [showConstellation, showDetails, showFractal, showTranscendence]);

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: baseProgressPercentage * 0.7 }}
        transition={{ duration: 2 }}
      >
        {constellationPaths.map((path, index) => (
          <motion.path
            key={`path-${index}`}
            d={path}
            className={`stroke-[0.2] ${
              showInfinity 
                ? 'stroke-violet-300/70'
                : showTranscendence 
                  ? 'stroke-indigo-300/60' 
                  : showFractal 
                    ? 'stroke-blue-400/60' 
                    : showConstellation 
                      ? 'stroke-blue-300/60' 
                      : 'stroke-blue-300/30'
            }`}
            animate={showTranscendence ? { 
              strokeWidth: [0.1, 0.25, 0.1],
              opacity: [0.4, 0.7, 0.4]
            } : {}}
            transition={showTranscendence ? { 
              duration: 4 + (index % 3), 
              repeat: Infinity, 
              repeatType: "reverse"
            } : {}}
          />
        ))}
        
        {/* Radiant pattern at highest level */}
        {showIllumination && (
          <>
            <path d="M50,30 L30,50 L50,70 L70,50 Z" className="stroke-cyan-300/40 stroke-[0.1] fill-cyan-400/5" />
            <path d="M40,40 L35,50 L40,60 L50,65 L60,60 L65,50 L60,40 L50,35 Z" className="stroke-blue-400/30 stroke-[0.1] fill-blue-400/5" />
          </>
        )}
        
        {/* Infinity mode - animated mandala patterns */}
        {showInfinity && (
          <motion.g
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <path 
              d="M50,30 C60,40 70,40 70,50 C70,60 60,60 50,70 C40,60 30,60 30,50 C30,40 40,40 50,30 Z" 
              className="stroke-purple-300/40 stroke-[0.1] fill-purple-400/5"
            />
            <path 
              d="M40,40 C45,35 55,35 60,40 C65,45 65,55 60,60 C55,65 45,65 40,60 C35,55 35,45 40,40 Z" 
              className="stroke-pink-300/30 stroke-[0.1] fill-pink-400/5"
            />
          </motion.g>
        )}
      </motion.g>
    </svg>
  );
};

export default ConstellationLines;
