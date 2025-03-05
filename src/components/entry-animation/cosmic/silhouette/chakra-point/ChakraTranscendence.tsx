
import React from 'react';
import { motion } from 'framer-motion';

interface ChakraTranscendenceProps {
  cx: number;
  cy: number;
  size: number;
  color: string;
  intensity: number;
  isActivated: boolean;
  showTranscendence: boolean;
  baseProgressPercentage: number;
  index: number;
}

/**
 * Enhanced transcendence effects for high-level chakras
 */
const ChakraTranscendence: React.FC<ChakraTranscendenceProps> = ({
  cx,
  cy,
  size,
  color,
  intensity,
  isActivated,
  showTranscendence,
  baseProgressPercentage,
}) => {
  if (!(showTranscendence && isActivated)) return null;

  return (
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
            repeatType: "reverse" as const,
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
            repeatType: "reverse" as const,
            ease: "easeInOut"
          }
        }}
      />
    </>
  );
};

export default ChakraTranscendence;
