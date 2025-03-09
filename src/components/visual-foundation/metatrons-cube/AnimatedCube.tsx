
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import MetatronsCube from './MetatronsCube';
import { MetatronsCubeProps } from './types';
import { usePerfConfig } from '@/hooks/usePerfConfig';

/**
 * AnimatedCube wraps MetatronsCube with animation effects 
 * that are conditionally applied based on device capability
 */
const AnimatedCube: React.FC<MetatronsCubeProps> = (props) => {
  const { config } = usePerfConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Determine if we should animate based on device capability
  const shouldAnimate = useCallback(() => {
    if (!props.withAnimation) return false;
    if (config.deviceCapability === 'low') return false;
    
    // Only animate once if device is medium capability
    if (config.deviceCapability === 'medium' && hasAnimated) return false;
    
    return true;
  }, [props.withAnimation, config.deviceCapability, hasAnimated]);
  
  useEffect(() => {
    // Check if we should animate
    if (shouldAnimate()) {
      setIsAnimating(true);
      setHasAnimated(true);
      
      // Stop animation after 3 seconds to save resources
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate]);

  // Reduce animation complexity for medium devices
  const getAnimationProps = () => {
    if (config.deviceCapability === 'high') {
      return {
        initial: { scale: 0.8, opacity: 0 },
        animate: { 
          scale: isAnimating ? [0.9, 1.05, 1] : 1, 
          opacity: 1,
          rotate: isAnimating ? [0, 5, 0, -5, 0] : 0
        },
        transition: { duration: isAnimating ? 2 : 0.5 }
      };
    }
    
    // Simpler animation for medium devices
    return {
      initial: { scale: 0.9, opacity: 0 },
      animate: { 
        scale: 1, 
        opacity: 1 
      },
      transition: { duration: 0.5 }
    };
  };

  return (
    <motion.div
      {...getAnimationProps()}
      className={props.className}
    >
      <MetatronsCube {...props} />
    </motion.div>
  );
};

export default AnimatedCube;
