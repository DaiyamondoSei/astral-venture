
import React from 'react';
import { motion } from 'framer-motion';

interface ChakraBaseProps {
  index: number;
  cx: number;
  cy: number;
  size: number;
  color: string;
  intensity: number;
  isActivated: boolean;
  baseProgressPercentage: number;
}

/**
 * The base chakra circle component
 */
const ChakraBase: React.FC<ChakraBaseProps> = ({
  cx,
  cy,
  size,
  color,
  intensity,
  isActivated,
}) => {
  // Animation variants for the chakra points
  const circleVariants = {
    initial: { 
      scale: 0, 
      opacity: 0 
    },
    animate: {
      scale: 1,
      opacity: isActivated ? 0.9 : 0.3,
      transition: { 
        type: "spring", 
        duration: 1 
      }
    }
  };

  return (
    <>
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
      {isActivated && (
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
    </>
  );
};

export default ChakraBase;
