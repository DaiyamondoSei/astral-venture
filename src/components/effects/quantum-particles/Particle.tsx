
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { QuantumParticle } from './types';

interface ParticleProps {
  particle: QuantumParticle;
  dx: number;
  dy: number;
}

/**
 * Individual quantum particle component
 * Optimized for performance with React.memo and useMemo
 */
const Particle: React.FC<ParticleProps> = ({ particle, dx, dy }) => {
  // Precalculate animation values for better performance
  const animationValues = useMemo(() => {
    return {
      animateX: [0, dx * 10, 0],
      animateY: [0, dy * 10, 0],
      animateScale: [1, 1.2, 1],
      animateOpacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as const,
        duration: particle.duration,
        delay: particle.delay,
        ease: "easeInOut" as const
      }
    };
  }, [dx, dy, particle.opacity, particle.duration, particle.delay]);
  
  // Base styles for the particle
  const particleStyle = useMemo(() => ({
    left: `${particle.x}%`,
    top: `${particle.y}%`,
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    backgroundColor: particle.color,
    opacity: particle.opacity,
  }), [particle]);
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={particleStyle}
      animate={{
        x: animationValues.animateX,
        y: animationValues.animateY,
        scale: animationValues.animateScale,
        opacity: animationValues.animateOpacity,
      }}
      transition={animationValues.transition}
    />
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(Particle);
