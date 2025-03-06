
import React from 'react';
import { motion } from 'framer-motion';
import { GlowIntensity, AnimationStyle } from '../onboarding/data/types';
import { getGlowClasses } from './utils';

interface ProgressGlowProps {
  progress: number;
  intensity: GlowIntensity;
  animation: AnimationStyle;
}

const ProgressGlow: React.FC<ProgressGlowProps> = ({ 
  progress, 
  intensity, 
  animation 
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

  if (animation === 'none' || progress === 0) {
    return null;
  }

  return (
    <motion.div
      className={`absolute inset-0 rounded-full ${getGlowClasses(intensity)}`}
      style={{ width: `${progress}%` }}
      animate={animation === 'none' ? undefined : glowVariants[animation]}
    />
  );
};

export default ProgressGlow;
