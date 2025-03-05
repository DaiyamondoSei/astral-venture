
import React from 'react';
import { motion } from 'framer-motion';

interface ChakraInfinityProps {
  cx: number;
  cy: number;
  size: number;
  color: string;
  intensity: number;
  isActivated: boolean;
  showInfinity: boolean;
  index: number;
}

/**
 * Special effects for infinity-level chakras
 */
const ChakraInfinity: React.FC<ChakraInfinityProps> = ({
  cx,
  cy,
  size,
  color,
  intensity,
  isActivated,
  showInfinity,
  index,
}) => {
  if (!(showInfinity && isActivated && intensity > 0.8)) return null;

  return (
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
              repeatType: "reverse" as const
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
  );
};

export default ChakraInfinity;
