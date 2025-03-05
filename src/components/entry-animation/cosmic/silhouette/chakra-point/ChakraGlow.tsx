
import React from 'react';
import { motion } from 'framer-motion';

interface ChakraGlowProps {
  cx: number;
  cy: number;
  size: number;
  color: string;
  intensity: number;
  isActivated: boolean;
  showIllumination: boolean;
  baseProgressPercentage: number;
  index: number;
}

/**
 * The glowing effects for illuminated chakras
 */
const ChakraGlow: React.FC<ChakraGlowProps> = ({
  cx,
  cy,
  size,
  color,
  intensity,
  isActivated,
  showIllumination,
  baseProgressPercentage,
  index
}) => {
  // Determine if we should show the glow effect
  const showGlow = showIllumination && isActivated;
  
  // Pulse variants for active chakras
  const pulseVariants = {
    initial: { 
      scale: 1, 
      opacity: 0.2 
    },
    animate: {
      scale: [1, 1 + (intensity * 0.4), 1],
      opacity: [0.2, 0.5, 0.2],
      transition: { 
        duration: 3 - (intensity * 1), 
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  };

  if (!showGlow) return null;

  return (
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
            repeatType: "reverse" as const, 
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
    </>
  );
};

export default ChakraGlow;
