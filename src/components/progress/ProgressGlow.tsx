
import React from 'react';
import { motion } from 'framer-motion';
import { GlowIntensity, AnimationStyle, ProgressColorScheme, ProgressGlowProps } from './types';
import { getGlowClasses, getProgressColorClasses } from './utils';

const ProgressGlow: React.FC<ProgressGlowProps> = ({ 
  progress, 
  intensity = 'medium',
  animation = 'none',
  colorScheme = 'primary'
}) => {
  // Animation variants
  const glowVariants = {
    pulse: {
      opacity: [0.5, 0.8, 0.5],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut",
      },
    },
    slide: {
      x: ["0%", "100%"],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut",
      },
    },
    ripple: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut",
      },
    },
    none: {}
  };

  // Fix for the type comparison issue
  if (progress === 0 || animation === 'none') {
    return null;
  }

  return (
    <motion.div
      className={`absolute inset-0 rounded-full ${getGlowClasses(intensity)} ${getProgressColorClasses(colorScheme)}`}
      style={{ width: `${progress}%` }}
      animate={animation === 'none' ? undefined : glowVariants[animation]}
    />
  );
};

export default ProgressGlow;
