
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlowEffect from '@/components/GlowEffect';

// Define different energy thresholds for visual progression
const ENERGY_THRESHOLDS = {
  BASE: 0,     // Basic silhouette
  CHAKRAS: 30, // Chakra points activate
  AURA: 100,   // Aura field becomes visible
  CONSTELLATION: 200, // Constellation lines become more complex
  DETAILS: 350, // Additional detailed elements
  ILLUMINATION: 500 // Full illumination of all body parts
};

interface CosmicAstralBodyProps {
  energyPoints?: number;
}

const CosmicAstralBody: React.FC<CosmicAstralBodyProps> = ({ energyPoints = 0 }) => {
  const [stars, setStars] = useState<{x: number, y: number, size: number, delay: number, duration: number}[]>([]);
  
  // Calculate progress percentage for animations (max at 600 points)
  const progressPercentage = Math.min(energyPoints / 600, 1);
  
  // Determine which visual elements should be active
  const showChakras = energyPoints >= ENERGY_THRESHOLDS.CHAKRAS;
  const showAura = energyPoints >= ENERGY_THRESHOLDS.AURA;
  const showConstellation = energyPoints >= ENERGY_THRESHOLDS.CONSTELLATION;
  const showDetails = energyPoints >= ENERGY_THRESHOLDS.DETAILS;
  const showIllumination = energyPoints >= ENERGY_THRESHOLDS.ILLUMINATION;
  
  // Calculate chakra intensity based on progress
  const getChakraIntensity = (baseChakraLevel: number) => {
    if (energyPoints < ENERGY_THRESHOLDS.CHAKRAS) return 0;
    
    const chakraActivationPoints = 
      ENERGY_THRESHOLDS.CHAKRAS + (baseChakraLevel * 15);
      
    if (energyPoints < chakraActivationPoints) return 0.3;
    if (energyPoints < chakraActivationPoints + 50) return 0.6;
    return 1;
  };
  
  useEffect(() => {
    // Generate more stars as energy increases
    const starCount = 50 + Math.floor(energyPoints / 20);
    const maxStars = 200;
    
    const randomStars = Array.from({ length: Math.min(starCount, maxStars) }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2
    }));
    
    setStars(randomStars);
  }, [energyPoints]);

  return (
    <div className="relative w-full aspect-[9/16] max-w-md mx-auto overflow-hidden rounded-xl">
      {/* Background stars - more appear and shine brighter with progress */}
      <div className="absolute inset-0 bg-black">
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: showIllumination ? 
                `rgba(${130 + Math.random() * 125}, ${180 + Math.random() * 75}, ${230}, 0.8)` : 
                'rgba(148, 163, 184, 0.8)'
            }}
            initial={{ opacity: 0.2 }}
            animate={{ 
              opacity: [0.2, 0.8, 0.2],
              boxShadow: [
                '0 0 2px rgba(148, 163, 184, 0.5)', 
                `0 0 ${8 + progressPercentage * 5}px rgba(148, 163, 184, 0.8)`, 
                '0 0 2px rgba(148, 163, 184, 0.5)'
              ]
            }}
            transition={{ 
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              repeatType: "loop" as const
            }}
          />
        ))}
      </div>
      
      {/* Cosmic Circles - more appear with higher energy */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3, 4, 5].map((circle, index) => {
          // Only show additional circles based on progress
          if (index > 2 && !showAura) return null;
          
          const intensity = Math.min(0.2 + (progressPercentage * 0.8), 1);
          
          return (
            <motion.div
              key={circle}
              className="absolute rounded-full border"
              style={{
                borderColor: showIllumination ? 
                  `rgba(72, 191, 227, ${0.3 * intensity})` : 
                  `rgba(56, 189, 248, ${0.3 * intensity})`
              }}
              initial={{ width: '40%', height: '40%', opacity: 0 }}
              animate={{ 
                width: ['40%', '90%'],
                height: ['40%', '90%'],
                opacity: [0, 0.6 * intensity, 0]
              }}
              transition={{
                duration: 4,
                delay: circle * (showDetails ? 1 : 1.5),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </div>
      
      {/* Constellation lines - more complex with progress */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: progressPercentage * 0.7 }}
          transition={{ duration: 2 }}
        >
          <path d="M20,30 L35,40 L50,35 L65,45 L80,30" 
                className={`stroke-[0.2] ${showConstellation ? 'stroke-blue-300/60' : 'stroke-blue-300/30'}`} />
          <path d="M25,50 L40,55 L50,50 L60,55 L75,50" 
                className={`stroke-[0.2] ${showConstellation ? 'stroke-blue-300/60' : 'stroke-blue-300/30'}`} />
          <path d="M20,70 L35,60 L50,65 L65,55 L80,70" 
                className={`stroke-[0.2] ${showConstellation ? 'stroke-blue-300/60' : 'stroke-blue-300/30'}`} />
          <path d="M50,20 L50,80" 
                className={`stroke-[0.2] ${showConstellation ? 'stroke-blue-300/50' : 'stroke-blue-300/20'}`} />
          
          {/* Additional constellation lines appear with higher energy */}
          {showConstellation && (
            <>
              <path d="M30,20 L40,30 L50,35 L60,30 L70,20" className="stroke-blue-300/40 stroke-[0.2]" />
              <path d="M20,40 L30,45 L40,42 L50,45 L60,42 L70,45 L80,40" className="stroke-blue-300/40 stroke-[0.2]" />
            </>
          )}
          
          {/* Even more detailed lines at higher levels */}
          {showDetails && (
            <>
              <path d="M25,25 L35,35 L45,30 L55,35 L65,30 L75,25" className="stroke-cyan-300/50 stroke-[0.15]" />
              <path d="M25,75 L35,65 L45,70 L55,65 L65,70 L75,75" className="stroke-cyan-300/50 stroke-[0.15]" />
              <path d="M40,20 L40,80" className="stroke-blue-300/30 stroke-[0.1]" />
              <path d="M60,20 L60,80" className="stroke-blue-300/30 stroke-[0.1]" />
            </>
          )}
          
          {/* Radiant pattern at highest level */}
          {showIllumination && (
            <>
              <path d="M50,30 L30,50 L50,70 L70,50 Z" className="stroke-cyan-300/40 stroke-[0.1] fill-cyan-400/5" />
              <path d="M40,40 L35,50 L40,60 L50,65 L60,60 L65,50 L60,40 L50,35 Z" className="stroke-blue-400/30 stroke-[0.1] fill-blue-400/5" />
            </>
          )}
        </motion.g>
      </svg>
      
      {/* Human silhouette */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative h-4/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <svg 
            className="h-full mx-auto astral-body-silhouette"
            viewBox="0 0 100 220" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="silhouetteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={showIllumination ? "rgba(86, 219, 228, 0.15)" : "rgba(56, 189, 248, 0.1)"} />
                <stop offset="50%" stopColor={showDetails ? "rgba(56, 189, 248, 0.05)" : "rgba(56, 189, 248, 0)"} />
                <stop offset="100%" stopColor={showIllumination ? "rgba(86, 219, 228, 0.15)" : "rgba(56, 189, 248, 0.1)"} />
              </linearGradient>
              
              {/* More advanced gradients at higher levels */}
              {showDetails && (
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="rgba(56, 189, 248, 0.3)" />
                  <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
                </radialGradient>
              )}
              
              {showIllumination && (
                <linearGradient id="chakraGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(147, 51, 234, 0.7)" />
                  <stop offset="50%" stopColor="rgba(59, 130, 246, 0.7)" />
                  <stop offset="100%" stopColor="rgba(236, 72, 153, 0.7)" />
                </linearGradient>
              )}
            </defs>
            
            {/* Full silhouette */}
            <path 
              d="M50,30 
                 C58,30 64,24 64,16 
                 C64,8 58,2 50,2 
                 C42,2 36,8 36,16 
                 C36,24 42,30 50,30 
                 Z 
                 M38,32 L62,32 
                 L64,45 L36,45 
                 Z 
                 M36,45 L64,45 
                 L68,100 L32,100 
                 Z
                 M32,100 L40,100 L36,140 L28,140 
                 Z
                 M68,100 L60,100 L64,140 L72,140 
                 Z
                 M36,140 L28,140 L30,170 L38,170 
                 Z
                 M64,140 L72,140 L70,170 L62,170 
                 Z"
              fill="url(#silhouetteGradient)"
              className={`astral-body-silhouette ${showIllumination ? 'stroke-cyan-300/30 stroke-[0.3]' : ''}`}
            />
            
            {/* Illuminated body segments that appear at higher levels */}
            {showDetails && (
              <>
                <path 
                  d="M50,30 C58,30 64,24 64,16 C64,8 58,2 50,2 C42,2 36,8 36,16 C36,24 42,30 50,30 Z"
                  fill="url(#centerGlow)"
                  className="astral-body-head"
                  opacity={progressPercentage * 0.8}
                />
                <path 
                  d="M38,32 L62,32 L64,45 L36,45 Z"
                  fill="url(#centerGlow)"
                  className="astral-body-chest"
                  opacity={progressPercentage * 0.7}
                />
                <path 
                  d="M36,45 L64,45 L68,100 L32,100 Z"
                  fill="url(#centerGlow)"
                  className="astral-body-torso"
                  opacity={progressPercentage * 0.6}
                />
              </>
            )}
            
            {/* Energy points/chakras with intensity based on progress */}
            <circle 
              cx="50" cy="16" r={showChakras ? 2.5 : 2} 
              className="energy-point crown-chakra" 
              fill={showIllumination ? "url(#chakraGradient)" : "#38BDF8"}
              opacity={getChakraIntensity(0)}
            >
              {showChakras && (
                <animate 
                  attributeName="r"
                  values={`${2};${2.5 + progressPercentage};${2}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            
            <circle 
              cx="50" cy="32" r={showChakras ? 2.5 : 2}
              className="energy-point throat-chakra" 
              fill={showIllumination ? "url(#chakraGradient)" : "#38BDF8"}
              opacity={getChakraIntensity(1)}
            >
              {showChakras && (
                <animate 
                  attributeName="r"
                  values={`${2};${2.5 + progressPercentage};${2}`}
                  dur="3.5s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            
            <circle 
              cx="50" cy="55" r={showChakras ? 3 : 2.5}
              className="energy-point heart-chakra" 
              fill={showIllumination ? "url(#chakraGradient)" : "#38BDF8"}
              opacity={getChakraIntensity(2)}
            >
              {showChakras && (
                <animate 
                  attributeName="r"
                  values={`${2.5};${3 + progressPercentage};${2.5}`}
                  dur="4s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            
            <circle 
              cx="50" cy="70" r={showChakras ? 2.5 : 2}
              className="energy-point solar-chakra" 
              fill={showIllumination ? "url(#chakraGradient)" : "#38BDF8"}
              opacity={getChakraIntensity(3)}
            >
              {showChakras && (
                <animate 
                  attributeName="r"
                  values={`${2};${2.5 + progressPercentage};${2}`}
                  dur="3.8s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            
            <circle 
              cx="50" cy="85" r={showChakras ? 2.5 : 2}
              className="energy-point sacral-chakra" 
              fill={showIllumination ? "url(#chakraGradient)" : "#38BDF8"}
              opacity={getChakraIntensity(4)}
            >
              {showChakras && (
                <animate 
                  attributeName="r"
                  values={`${2};${2.5 + progressPercentage};${2}`}
                  dur="3.2s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            
            <circle 
              cx="50" cy="100" r={showChakras ? 3 : 2.5}
              className="energy-point root-chakra" 
              fill={showIllumination ? "url(#chakraGradient)" : "#38BDF8"}
              opacity={getChakraIntensity(5)}
            >
              {showChakras && (
                <animate 
                  attributeName="r"
                  values={`${2.5};${3 + progressPercentage};${2.5}`}
                  dur="4.5s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          </svg>
          
          {/* Central glow behind the silhouette */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              className={`w-1/2 h-1/2 rounded-full blur-xl ${
                showIllumination 
                  ? 'bg-gradient-to-t from-blue-500/30 to-cyan-400/30'
                  : 'bg-gradient-to-t from-blue-500/20 to-cyan-400/20'
              }`}
              initial={{ opacity: 0.3 }}
              animate={{ 
                opacity: [0.3, 0.3 + (progressPercentage * 0.5), 0.3],
                scale: [0.9, 1 + (progressPercentage * 0.2), 0.9],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse" as const
              }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Pulsing light effect - intensity increases with progress */}
      <GlowEffect 
        className="absolute inset-0 w-full h-full rounded-lg"
        animation="pulse"
        color={`rgba(56, 189, 248, ${0.1 + (progressPercentage * 0.2)})`}
        intensity={progressPercentage > 0.7 ? "high" : progressPercentage > 0.3 ? "medium" : "low"}
      />
      
      {/* Central bright light at center of body - grows with progress */}
      <motion.div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl ${
          showIllumination ? 'bg-cyan-300/90' : 'bg-blue-300/80'
        }`}
        style={{
          width: `${8 + (progressPercentage * 10)}px`,
          height: `${8 + (progressPercentage * 10)}px`
        }}
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.5 + (progressPercentage * 0.4), 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse" as const
        }}
      />
      
      {/* Progress level indicator - only appears after base level */}
      {energyPoints > 10 && (
        <div className="absolute bottom-2 right-2 text-xs text-cyan-200/70 font-mono">
          Level: {Math.floor(energyPoints / 50) + 1}
        </div>
      )}
    </div>
  );
};

export default CosmicAstralBody;
