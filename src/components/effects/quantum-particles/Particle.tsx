
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { QuantumParticle } from './types';
import { useThrottledAnimation } from './hooks/useThrottledAnimation';

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
  // Get throttled animation values based on device performance
  const animationValues = useThrottledAnimation({
    animateX: [0, dx * 10, 0],
    animateY: [0, dy * 10, 0],
    animateScale: [1, 1.2, 1],
    animateOpacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
    duration: particle.duration,
    delay: particle.delay
  });
  
  // Base styles for the particle - memoized to prevent recreation
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
      animate={animationValues.animate}
      transition={animationValues.transition}
    />
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(Particle);
