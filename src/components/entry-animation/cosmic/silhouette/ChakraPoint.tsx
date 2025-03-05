
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CHAKRA_COLORS } from '../types';

interface ChakraPointProps {
  index: number;
  intensity: number;
  isActivated: boolean;
  showDetails: boolean;
  showIllumination: boolean;
  cx?: number;
  cy?: number;
  chakraIndex?: number;
  showChakras?: boolean;
  showFractal?: boolean;
  showTranscendence?: boolean; 
  showInfinity?: boolean;
  baseProgressPercentage?: number;
}

const ChakraPoint: React.FC<ChakraPointProps> = ({
  index,
  intensity,
  isActivated,
  showDetails,
  showIllumination,
  cx = 150,
  cy = 200,
  showFractal = false,
  showTranscendence = false,
  showInfinity = false,
  baseProgressPercentage = 1
}) => {
  // Using CHAKRA_COLORS directly instead of relying on CHAKRA_POSITIONS
  const color = CHAKRA_COLORS[index];
  
  // Scale size and opacity based on activation, details level, and intensity
  const baseSize = isActivated ? 4 : 2;
  const intensityBonus = isActivated ? intensity * 3 : 0;
  const size = showDetails ? baseSize + 1.5 + intensityBonus : baseSize + intensityBonus;
  
  // Adjust opacity based on activation, illumination and intensity
  const baseOpacity = isActivated ? 0.9 : 0.3;
  const opacityBoost = showIllumination ? 0.2 : 0;
  const opacity = Math.min(baseOpacity + opacityBoost, 1.0) * (0.6 + intensity * 0.4);
  
  // Determine if we should show the glow effect
  const showGlow = showIllumination && isActivated;
  
  // Calculate pulse animation parameters based on intensity
  const pulseScale = 1 + (intensity * 0.4);
  const pulseDuration = 3 - (intensity * 1); // Faster pulse for higher intensity
  
  // Get chakra name for accessibility
  const chakraNames = [
    "Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"
  ];
  const chakraName = chakraNames[index] || `Chakra ${index + 1}`;
  
  // Animation variants for the chakra points
  const circleVariants = {
    initial: { 
      scale: 0, 
      opacity: 0 
    },
    animate: {
      scale: 1,
      opacity: opacity,
      transition: { 
        type: "spring", 
        duration: 1 
      }
    }
  };
  
  // Pulse variants for active chakras - FIXED: repeatType is now explicitly typed as "loop"
  const pulseVariants = {
    initial: { 
      scale: 1, 
      opacity: 0.2 
    },
    animate: {
      scale: [1, pulseScale, 1],
      opacity: [0.2, 0.5, 0.2],
      transition: { 
        duration: pulseDuration, 
        repeat: Infinity,
        repeatType: "loop" as const  // Fixed: Using 'as const' to specify literal type
      }
    }
  };
  
  // Rays variants for illuminated chakras
  const raysVariants = {
    initial: { 
      scale: 0, 
      opacity: 0 
    },
    animate: {
      scale: 1,
      opacity: intensity * 0.7,
      transition: { 
        duration: 1.5,
        delay: 0.5
      }
    }
  };
  
  // Dynamic ray animation based on chakra intensity
  const rayRef = useRef<SVGGElement>(null);
  
  useEffect(() => {
    if (rayRef.current && isActivated && showIllumination && intensity > 0.7) {
      const rotateAnimation = () => {
        let angle = 0;
        const rotate = () => {
          if (rayRef.current) {
            angle += 0.2 * intensity;
            rayRef.current.style.transform = `rotate(${angle}deg)`;
            requestAnimationFrame(rotate);
          }
        };
        
        requestAnimationFrame(rotate);
      };
      
      rotateAnimation();
    }
  }, [isActivated, showIllumination, intensity]);
  
  return (
    <g className="chakra-point" aria-label={`${chakraName} chakra${isActivated ? ' active' : ' inactive'}`}>
      {/* Enhanced chakra glows with layered effects for higher consciousness states */}
      {showTranscendence && isActivated && (
        <>
          <motion.circle
            cx={cx}
            cy={cy}
            r={size * 3}
            fill={`url(#chakraGlow${index})`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: intensity * 0.3 * baseProgressPercentage, 
              scale: 1.2,
              transition: { 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse" as const,  // Fixed: Using 'as const' to specify literal type
                ease: "easeInOut"
              }
            }}
          />
          {/* Additional ethereal glow layer for transcendence state */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={size * 4}
            fill="none"
            stroke={`${color}40`}
            strokeWidth={0.8}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: intensity * 0.2 * baseProgressPercentage,
              scale: [1, 1.1, 1],
              transition: { 
                duration: 4, 
                repeat: Infinity,
                repeatType: "reverse" as const,  // Fixed: Using 'as const' to specify literal type
                ease: "easeInOut"
              }
            }}
          />
        </>
      )}
      
      {/* Enhanced outer glow for activated chakras */}
      {showGlow && (
        <>
          <motion.circle
            cx={cx}
            cy={cy}
            r={size + 5 + (intensity * 3)}
            fill={`url(#chakraGlow${index})`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: intensity * 0.5 * baseProgressPercentage, 
              scale: 1,
              transition: { 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" as const,  // Fixed: Using 'as const' to specify literal type
                ease: "easeInOut"
              }
            }}
          />
          
          {/* Additional soft glow layer for more depth */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={size + 8}
            fill="none"
            stroke={color}
            strokeWidth={0.3}
            strokeOpacity={0.6}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: intensity * 0.3,
              scale: [1, 1.2, 1],
              transition: { 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse" as const,
                ease: "easeInOut"
              }
            }}
          />
        </>
      )}
      
      {/* Outer pulse effect for highly active chakras */}
      {isActivated && intensity > 0.5 && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={size + 6}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        />
      )}
      
      {/* Main chakra circle with improved animation */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={size}
        fill={color}
        variants={circleVariants}
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.2, opacity: 1 }}
      />
      
      {/* Inner detail for activated chakras */}
      {isActivated && showDetails && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={size / 2}
          fill="white"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: intensity * 0.8, 
            scale: 1,
            transition: { duration: 0.8, delay: 0.3 }
          }}
        />
      )}
      
      {/* Enhanced energy rays for highly activated chakras with illumination */}
      {isActivated && showIllumination && intensity > 0.7 && (
        <g ref={rayRef}>
          {/* More rays for a fuller effect */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
            <motion.line
              key={`ray-${index}-${i}`}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(angle * Math.PI / 180) * (size + 10 + intensity * 5)}
              y2={cy + Math.sin(angle * Math.PI / 180) * (size + 10 + intensity * 5)}
              stroke={color}
              strokeWidth="0.7"
              variants={raysVariants}
              initial="initial"
              animate="animate"
              custom={i * 0.1}
            />
          ))}
        </g>
      )}
      
      {/* Add enhanced effects for infinity level chakras */}
      {showInfinity && isActivated && intensity > 0.8 && (
        <>
          <motion.circle
            cx={cx}
            cy={cy}
            r={size * 2.5}
            fill="none"
            stroke={`${color}80`}
            strokeWidth="0.8"
            strokeDasharray="2 3"
            initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{ 
              opacity: 0.7, 
              scale: [1, 1.2, 1],
              rotate: 360,
              transition: { 
                opacity: { duration: 1 },
                scale: { 
                  duration: 4, 
                  repeat: Infinity,
                  repeatType: "reverse" as const  // Fixed: Using 'as const' to specify literal type
                },
                rotate: { 
                  duration: 20, 
                  repeat: Infinity,
                  ease: "linear"
                }
              }
            }}
          />
          
          {/* Cosmic particles orbiting the chakra */}
          {[1, 2, 3, 4, 5].map((_, i) => {
            const radius = size * 2 + i * 3;
            const speed = 10 + (i * 2);
            const delay = i * 0.5;
            const particleSize = 0.8 - (i * 0.1);
            
            return (
              <motion.circle
                key={`particle-${index}-${i}`}
                cx={cx + radius}
                cy={cy}
                r={particleSize}
                fill="white"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.5, 0.9, 0.5],
                  rotate: 360,
                  transition: { 
                    opacity: {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse" as const
                    },
                    rotate: {
                      duration: speed,
                      repeat: Infinity,
                      ease: "linear",
                      delay: delay
                    }
                  }
                }}
                style={{
                  transformOrigin: `${cx}px ${cy}px`
                }}
              />
            );
          })}
        </>
      )}
    </g>
  );
};

export default ChakraPoint;
