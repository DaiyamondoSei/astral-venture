
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MetatronsCube from './MetatronsCube';
import { MetatronsCubeProps } from './types';
import { usePerfConfig } from '@/hooks/usePerfConfig';

const AnimatedCube: React.FC<MetatronsCubeProps> = (props) => {
  const { config } = usePerfConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    // Only animate on high-performance devices unless explicitly requested
    if (props.withAnimation && config.deviceCapability !== 'low') {
      setIsAnimating(true);
      
      // Stop animation after 3 seconds to save resources
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [props.withAnimation, config.deviceCapability]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: isAnimating ? [0.9, 1.05, 1] : 1, 
        opacity: 1,
        rotate: isAnimating ? [0, 5, 0, -5, 0] : 0
      }}
      transition={{ duration: isAnimating ? 2 : 0.5 }}
      className={props.className}
    >
      <MetatronsCube {...props} />
    </motion.div>
  );
};

export default AnimatedCube;
