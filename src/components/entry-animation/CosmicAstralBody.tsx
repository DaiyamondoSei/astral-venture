
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlowEffect from '@/components/GlowEffect';

// Define different energy thresholds for visual progression
const ENERGY_THRESHOLDS = {
  BASE: 0,          // Basic silhouette
  CHAKRAS: 30,      // Chakra points activate
  AURA: 100,        // Aura field becomes visible
  CONSTELLATION: 200, // Constellation lines become more complex
  DETAILS: 350,     // Additional detailed elements
  ILLUMINATION: 500, // Full illumination of all body parts
  FRACTAL: 750,     // Fractal patterns emerge
  TRANSCENDENCE: 1000, // Transcendent state
  INFINITY: 2000    // Near-infinite complexity
};

interface CosmicAstralBodyProps {
  energyPoints?: number;
}

const CosmicAstralBody: React.FC<CosmicAstralBodyProps> = ({ energyPoints = 0 }) => {
  const [stars, setStars] = useState<{x: number, y: number, size: number, delay: number, duration: number}[]>([]);
  const [fractalPoints, setFractalPoints] = useState<{x: number, y: number, size: number, rotation: number}[]>([]);
  
  // Calculate base progress percentage for animations (max at 600 points)
  const baseProgressPercentage = Math.min(energyPoints / 600, 1);
  
  // Calculate logarithmic progress for "infinite" scaling - never reaches 1.0
  const infiniteProgress = Math.log10(energyPoints + 1) / Math.log10(10000);
  
  // Calculate fractal complexity - increases logarithmically
  const fractalComplexity = Math.min(Math.log10(energyPoints + 1) * 2, 10);
  
  // Determine which visual elements should be active
  const showChakras = energyPoints >= ENERGY_THRESHOLDS.CHAKRAS;
  const showAura = energyPoints >= ENERGY_THRESHOLDS.AURA;
  const showConstellation = energyPoints >= ENERGY_THRESHOLDS.CONSTELLATION;
  const showDetails = energyPoints >= ENERGY_THRESHOLDS.DETAILS;
  const showIllumination = energyPoints >= ENERGY_THRESHOLDS.ILLUMINATION;
  const showFractal = energyPoints >= ENERGY_THRESHOLDS.FRACTAL;
  const showTranscendence = energyPoints >= ENERGY_THRESHOLDS.TRANSCENDENCE;
  const showInfinity = energyPoints >= ENERGY_THRESHOLDS.INFINITY;
  
  // Calculate chakra intensity based on progress
  const getChakraIntensity = (baseChakraLevel: number) => {
    if (energyPoints < ENERGY_THRESHOLDS.CHAKRAS) return 0;
    
    const chakraActivationPoints = 
      ENERGY_THRESHOLDS.CHAKRAS + (baseChakraLevel * 15);
      
    if (energyPoints < chakraActivationPoints) return 0.3;
    if (energyPoints < chakraActivationPoints + 50) return 0.6;
    return 1;
  };
  
  // Generate color based on energy level - moves through a spectrum
  const generateEnergyColor = (base: string, intensity: number = 1) => {
    if (showInfinity) {
      // Create a rainbow effect for infinity level
      const hue = (Date.now() / 50) % 360; // Constantly changing hue
      return `hsla(${hue}, 80%, 60%, ${intensity})`;
    }
    
    if (showTranscendence) {
      // White-gold for transcendence level
      return `rgba(255, 250, ${220 + Math.sin(Date.now()/1000) * 35}, ${intensity})`;
    }
    
    if (showFractal) {
      // Vibrant blue-purple for fractal level
      return `rgba(${100 + Math.sin(Date.now()/1000) * 20}, 100, ${200 + Math.sin(Date.now()/800) * 55}, ${intensity})`;
    }
    
    if (showIllumination) {
      // Cyan color for illumination level
      return `rgba(72, 191, 227, ${intensity})`;
    }
    
    // Default blue color
    return `rgba(56, 189, 248, ${intensity})`;
  };
  
  // Generate fractal patterns using a simplified algorithm
  const generateFractalPoints = () => {
    if (!showFractal) return [];
    
    const points = [];
    const iterations = Math.min(Math.floor(fractalComplexity * 5), 40);
    const centerX = 50;
    const centerY = 50;
    const radius = 30 + (infiniteProgress * 10);
    
    // Create a simplified fractal pattern
    for (let i = 0; i < iterations; i++) {
      const angle = (i / iterations) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Add main points
      points.push({ 
        x, 
        y, 
        size: 1 + (Math.sin(i * 0.5) * 0.5), 
        rotation: angle 
      });
      
      // Add sub-points for more complex fractals
      if (showTranscendence) {
        const subRadius = radius * 0.7;
        const subAngle = angle + (Math.PI / iterations);
        const subX = centerX + Math.cos(subAngle) * subRadius;
        const subY = centerY + Math.sin(subAngle) * subRadius;
        
        points.push({ 
          x: subX, 
          y: subY, 
          size: 0.8, 
          rotation: subAngle 
        });
      }
      
      // Add even more complex structures at infinity level
      if (showInfinity && i % 2 === 0) {
        const microRadius = radius * 0.4;
        const microAngle = angle + (Math.PI / iterations) * 3;
        const microX = centerX + Math.cos(microAngle) * microRadius;
        const microY = centerY + Math.sin(microAngle) * microRadius;
        
        points.push({ 
          x: microX, 
          y: microY, 
          size: 0.6 + (Math.random() * 0.4), 
          rotation: microAngle * 2 
        });
      }
    }
    
    return points;
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
    setFractalPoints(generateFractalPoints());
    
    // Set interval to update fractal patterns for continuous animation
    if (showFractal) {
      const intervalId = setInterval(() => {
        setFractalPoints(generateFractalPoints());
      }, showInfinity ? 100 : 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [energyPoints, showFractal, showTranscendence, showInfinity, fractalComplexity, infiniteProgress]);

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
    <div className="relative w-full aspect-[9/16] max-w-md mx-auto overflow-hidden rounded-xl">
      {/* Background stars - more appear and shine brighter with progress */}
      <div className={`absolute inset-0 ${showTranscendence ? 'bg-gradient-to-b from-black to-blue-950/30' : 'bg-black'}`}>
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: generateEnergyColor('rgba(148, 163, 184, 0.8)', 0.8)
            }}
            initial={{ opacity: 0.2 }}
            animate={{ 
              opacity: [0.2, 0.8, 0.2],
              boxShadow: [
                '0 0 2px rgba(148, 163, 184, 0.5)', 
                `0 0 ${8 + baseProgressPercentage * 5}px ${generateEnergyColor('rgba(148, 163, 184, 0.8)', 0.5)}`, 
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
      
      {/* Fractal patterns - visible at higher energy levels */}
      {showFractal && (
        <div className="absolute inset-0">
          {fractalPoints.map((point, index) => (
            <motion.div
              key={`fractal-${index}`}
              className="absolute"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: `${point.size * 5}px`,
                height: `${point.size * 5}px`,
                borderRadius: showInfinity ? '0' : '50%',
                background: generateEnergyColor('rgba(120, 170, 255, 0.6)', 0.6),
                transform: `rotate(${point.rotation}rad)`,
              }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.2, 1],
                boxShadow: [
                  `0 0 3px ${generateEnergyColor('rgba(120, 170, 255, 0.3)', 0.3)}`,
                  `0 0 8px ${generateEnergyColor('rgba(120, 170, 255, 0.6)', 0.6)}`,
                  `0 0 3px ${generateEnergyColor('rgba(120, 170, 255, 0.3)', 0.3)}`
                ]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse" as const
              }}
            />
          ))}
        </div>
      )}
      
      {/* Cosmic Circles - more appear with higher energy */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3, 4, 5, 6, 7].map((circle, index) => {
          // Only show additional circles based on progress
          if ((index > 2 && !showAura) || 
              (index > 4 && !showFractal) || 
              (index > 5 && !showTranscendence)) return null;
          
          const intensity = Math.min(0.2 + (baseProgressPercentage * 0.8), 1);
          const circleColor = generateEnergyColor('rgba(56, 189, 248, 0.3)', 0.3 * intensity);
          
          return (
            <motion.div
              key={circle}
              className="absolute rounded-full border"
              style={{
                borderColor: circleColor,
                transform: showTranscendence ? `rotate(${circle * 45}deg)` : ""
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
      
      {/* Transcendence Effect - only at highest levels */}
      {showTranscendence && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 2 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100" opacity="0.4">
            <defs>
              <radialGradient id="transcendenceGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </radialGradient>
              
              {/* Create dynamic filters for infinity level */}
              {showInfinity && (
                <>
                  <filter id="infinityGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feColorMatrix in="blur" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </>
              )}
            </defs>
            
            {/* Transcendence rings */}
            <motion.circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="url(#transcendenceGlow)" 
              strokeWidth="0.5"
              animate={{ r: [40, 45, 40] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            
            {/* Infinity level adds more complex transcendence effects */}
            {showInfinity && (
              <>
                <motion.path
                  d="M50,20 C70,20 70,80 50,80 C30,80 30,20 50,20 Z"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="0.3"
                  filter="url(#infinityGlow)"
                  animate={{ 
                    d: [
                      "M50,20 C70,20 70,80 50,80 C30,80 30,20 50,20 Z",
                      "M50,20 C80,30 80,70 50,80 C20,70 20,30 50,20 Z",
                      "M50,20 C70,20 70,80 50,80 C30,80 30,20 50,20 Z"
                    ]
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
              </>
            )}
          </svg>
        </motion.div>
      )}
      
      {/* Constellation lines - more complex with progress */}
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
                repeatType: "reverse" as const 
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
                <stop offset="0%" stopColor={showInfinity ? "rgba(180, 220, 255, 0.2)" : showTranscendence ? "rgba(140, 200, 255, 0.18)" : showIllumination ? "rgba(86, 219, 228, 0.15)" : "rgba(56, 189, 248, 0.1)"} />
                <stop offset="50%" stopColor={showDetails ? "rgba(56, 189, 248, 0.05)" : "rgba(56, 189, 248, 0)"} />
                <stop offset="100%" stopColor={showInfinity ? "rgba(180, 220, 255, 0.2)" : showTranscendence ? "rgba(140, 200, 255, 0.18)" : showIllumination ? "rgba(86, 219, 228, 0.15)" : "rgba(56, 189, 248, 0.1)"} />
              </linearGradient>
              
              {/* More advanced gradients at higher levels */}
              {showDetails && (
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor={showInfinity ? "rgba(140, 180, 255, 0.5)" : showTranscendence ? "rgba(100, 150, 255, 0.4)" : "rgba(56, 189, 248, 0.3)"} />
                  <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
                </radialGradient>
              )}
              
              {showIllumination && (
                <linearGradient id="chakraGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={showInfinity ? "rgba(180, 100, 255, 0.8)" : showTranscendence ? "rgba(160, 80, 255, 0.75)" : "rgba(147, 51, 234, 0.7)"} />
                  <stop offset="50%" stopColor={showInfinity ? "rgba(100, 160, 255, 0.8)" : showTranscendence ? "rgba(80, 140, 255, 0.75)" : "rgba(59, 130, 246, 0.7)"} />
                  <stop offset="100%" stopColor={showInfinity ? "rgba(255, 100, 180, 0.8)" : showTranscendence ? "rgba(255, 80, 170, 0.75)" : "rgba(236, 72, 153, 0.7)"} />
                </linearGradient>
              )}
              
              {/* Fractal level adds complex patterns */}
              {showFractal && (
                <pattern id="fractalPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(100, 180, 255, 0.4)" strokeWidth="0.5" />
                  <circle cx="10" cy="10" r="4" fill="none" stroke="rgba(120, 200, 255, 0.3)" strokeWidth="0.3" />
                  <circle cx="10" cy="10" r="1" fill="rgba(140, 220, 255, 0.5)" />
                </pattern>
              )}
              
              {/* Transcendence level adds ethereal glow */}
              {showTranscendence && (
                <filter id="etherealGlow">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feColorMatrix 
                    in="blur" 
                    type="matrix" 
                    values="0 0 0 0 0.5 0 0 0 0 0.8 0 0 0 0 1 0 0 0 0.7 0"
                    result="coloredBlur" 
                  />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              )}
              
              {/* Infinity level adds cosmic rays */}
              {showInfinity && (
                <>
                  <filter id="cosmicRays">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feColorMatrix 
                      in="blur" 
                      type="matrix" 
                      values="0 0 0 0 0.7 0 0 0 0 0.9 0 0 0 0 1 0 0 0 0.9 0"
                      result="coloredBlur" 
                    />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  
                  <radialGradient id="infiniteGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                    <stop offset="30%" stopColor="rgba(180, 220, 255, 0.7)" />
                    <stop offset="70%" stopColor="rgba(140, 180, 255, 0.4)" />
                    <stop offset="100%" stopColor="rgba(100, 140, 255, 0)" />
                  </radialGradient>
                </>
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
              fill={showFractal ? "url(#fractalPattern)" : "url(#silhouetteGradient)"}
              className={`astral-body-silhouette ${
                showInfinity 
                  ? 'stroke-violet-300/40 stroke-[0.4]' 
                  : showTranscendence 
                    ? 'stroke-indigo-300/35 stroke-[0.35]' 
                    : showIllumination 
                      ? 'stroke-cyan-300/30 stroke-[0.3]' 
                      : ''
              }`}
              filter={showInfinity 
                ? "url(#cosmicRays)" 
                : showTranscendence 
                  ? "url(#etherealGlow)" 
                  : undefined
              }
            />
            
            {/* Illuminated body segments that appear at higher levels */}
            {showDetails && (
              <>
                <path 
                  d="M50,30 C58,30 64,24 64,16 C64,8 58,2 50,2 C42,2 36,8 36,16 C36,24 42,30 50,30 Z"
                  fill="url(#centerGlow)"
                  className="astral-body-head"
                  opacity={baseProgressPercentage * 0.8}
                />
                <path 
                  d="M38,32 L62,32 L64,45 L36,45 Z"
                  fill="url(#centerGlow)"
                  className="astral-body-chest"
                  opacity={baseProgressPercentage * 0.7}
                />
                <path 
                  d="M36,45 L64,45 L68,100 L32,100 Z"
                  fill="url(#centerGlow)"
                  className="astral-body-torso"
                  opacity={baseProgressPercentage * 0.6}
                />
                
                {/* Fractal level adds more detailed body illumination */}
                {showFractal && (
                  <>
                    <path 
                      d="M32,100 L40,100 L36,140 L28,140 Z"
                      fill="url(#centerGlow)"
                      className="astral-body-leg-left"
                      opacity={baseProgressPercentage * 0.5}
                    />
                    <path 
                      d="M68,100 L60,100 L64,140 L72,140 Z"
                      fill="url(#centerGlow)"
                      className="astral-body-leg-right"
                      opacity={baseProgressPercentage * 0.5}
                    />
                  </>
                )}
                
                {/* Transcendence level completes the body illumination */}
                {showTranscendence && (
                  <>
                    <path 
                      d="M36,140 L28,140 L30,170 L38,170 Z"
                      fill="url(#centerGlow)"
                      className="astral-body-foot-left"
                      opacity={baseProgressPercentage * 0.5}
                    />
                    <path 
                      d="M64,140 L72,140 L70,170 L62,170 Z"
                      fill="url(#centerGlow)"
                      className="astral-body-foot-right"
                      opacity={baseProgressPercentage * 0.5}
                    />
                  </>
                )}
              </>
            )}
            
            {/* Energy points/chakras with intensity based on progress */}
            <circle 
              cx="50" cy="16" r={showChakras ? 2.5 : 2} 
              className="energy-point crown-chakra" 
              fill={showIllumination ? "url(#chakraGradient)" : generateEnergyColor("#38BDF8")}
              opacity={getChakraIntensity(0)}
              filter={showInfinity ? "url(#cosmicRays)" : undefined}
            >
              {showChakras && (
                <animate 
                  attributeName="r"
                  values={`${2};${2.5 + baseProgressPercentage};${2}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            
            <circle 
              cx="50" cy="32" r={showChakras ? 2.5 : 2}
              className="energy-point throat-chakra" 
              fill={showIllumination ? "url(#chakraGradient)" : generateEnergyColor("#38BDF8")}
              opacity={getChakraIntensity(1)}
              filter={showInfinity ? "url(#cosmicRays)" : undefined}
            >
              {showChakras && (
                <animate 
                  attributeName="r"
                  values={`${2};${2.5 + baseProgressPercentage};${2}`}
                  dur="3.5s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            
            <circle 
              cx="50" cy="55" r={showChakras ? 3 : 2.5}
              className="energy-point heart-chakra" 
              fill={showIllumination ? "url(#chakraGradient)" : generateEnergyColor("#38BDF8")}
              opacity={getChakraIntensity(2)}
              filter={showInfinity ? "url(#cosmicRays)" : undefined}
            >
              {showChakras && (
                <animate 
                  attributeName="r"
                  values={`${2.5};${3 + baseProgressPercentage};${2.5}`}
                  dur="4s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            
            <circle 
              cx="50" cy="70" r={showChakras ? 2.5 : 2}
              className="energy-point solar-chakra" 
              fill={showIllumination ? "url(#chakraGradient)" : generateEnergyColor("#38BDF8")}
              opacity={getChakraIntensity(3)}
              filter={showInfinity ? "url(#cosmicRays)" : undefined}
            >
              {showChakras && (
                <animate 
                  attributeName="r"
                  values={`${2};${2.5 + baseProgressPercentage};${2}`}
                  dur="3.8s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            
            <circle 
              cx="50" cy="85" r={showChakras ? 2.5 : 2}
              className="energy-point sacral-chakra" 
              fill={showIllumination ? "url(#chakraGradient)" : generateEnergyColor("#38BDF8")}
              opacity={getChakraIntensity(4)}
              filter={showInfinity ? "url(#cosmicRays)" : undefined}
            >
              {showChakras && (
                <animate 
                  attributeName="r"
                  values={`${2};${2.5 + baseProgressPercentage};${2}`}
                  dur="3.2s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            
            <circle 
              cx="50" cy="100" r={showChakras ? 3 : 2.5}
              className="energy-point root-chakra" 
              fill={showIllumination ? "url(#chakraGradient)" : generateEnergyColor("#38BDF8")}
              opacity={getChakraIntensity(5)}
              filter={showInfinity ? "url(#cosmicRays)" : undefined}
            >
              {showChakras && (
                <animate 
                  attributeName="r"
                  values={`${2.5};${3 + baseProgressPercentage};${2.5}`}
                  dur="4.5s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            
            {/* Infinity level core essence */}
            {showInfinity && (
              <circle 
                cx="50" cy="55" r="4"
                fill="url(#infiniteGlow)"
                opacity="0.9"
              >
                <animate 
                  attributeName="r"
                  values="3;5;3"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </svg>
          
          {/* Central glow behind the silhouette */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              className={`w-1/2 h-1/2 rounded-full blur-xl ${
                showInfinity 
                  ? 'bg-gradient-to-t from-blue-500/40 to-violet-400/40'
                  : showTranscendence 
                    ? 'bg-gradient-to-t from-blue-500/35 to-indigo-400/35'
                    : showIllumination 
                      ? 'bg-gradient-to-t from-blue-500/30 to-cyan-400/30'
                      : 'bg-gradient-to-t from-blue-500/20 to-cyan-400/20'
              }`}
              initial={{ opacity: 0.3 }}
              animate={{ 
                opacity: [0.3, 0.3 + (baseProgressPercentage * 0.5), 0.3],
                scale: [0.9, 1 + (baseProgressPercentage * 0.2), 0.9],
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
        color={generateEnergyColor(`rgba(56, 189, 248, ${0.1 + (baseProgressPercentage * 0.2)})`)}
        intensity={baseProgressPercentage > 0.7 ? "high" : baseProgressPercentage > 0.3 ? "medium" : "low"}
      />
      
      {/* Central bright light at center of body - grows with progress */}
      <motion.div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl ${
          showInfinity 
            ? 'bg-violet-300/95'
            : showTranscendence 
              ? 'bg-indigo-300/92'
              : showIllumination 
                ? 'bg-cyan-300/90' 
                : 'bg-blue-300/80'
        }`}
        style={{
          width: `${8 + (baseProgressPercentage * 10)}px`,
          height: `${8 + (baseProgressPercentage * 10)}px`
        }}
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.5 + (baseProgressPercentage * 0.4), 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse" as const
        }}
      />
      
      {/* Transcendence level essence */}
      {showTranscendence && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 2 }}
        >
          <motion.div
            className="relative"
            animate={{ 
              rotate: 360,
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div 
                key={`ray-${i}`}
                className="absolute w-1 rounded-full"
                style={{
                  height: `${60 + (i % 3) * 10}px`,
                  left: '50%',
                  top: '50%',
                  backgroundColor: showInfinity ? 'rgba(220, 220, 255, 0.4)' : 'rgba(200, 200, 255, 0.3)',
                  transformOrigin: 'center bottom',
                  transform: `translateX(-50%) translateY(-100%) rotate(${i * 30}deg)`,
                }}
                animate={{ 
                  height: [`${60 + (i % 3) * 10}px`, `${80 + (i % 3) * 15}px`, `${60 + (i % 3) * 10}px`] 
                }}
                transition={{
                  duration: 3 + (i % 3),
                  repeat: Infinity,
                  repeatType: "reverse" as const,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
      
      {/* Progress level indicator - only appears after base level */}
      {energyPoints > 10 && (
        <div className={`absolute bottom-2 right-2 text-xs ${
          showInfinity 
            ? 'text-violet-200/80'
            : showTranscendence
              ? 'text-indigo-200/75'
              : 'text-cyan-200/70'
        } font-mono`}>
          Level: {Math.floor(energyPoints / 50) + 1}
        </div>
      )}
      
      {/* Cosmic energy level */}
      {showTranscendence && (
        <div className="absolute top-2 left-2 text-xs text-indigo-200/75 font-mono">
          Cosmic Energy: {energyPoints.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default CosmicAstralBody;

