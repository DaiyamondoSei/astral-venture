
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParticleProps } from './types';

const ParticleComponent: React.FC<ParticleProps> = ({ particle }) => {
  // Memoize the style to prevent recalculation on every render
  const particleStyle = useMemo(() => ({
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    backgroundColor: particle.color,
    boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
    // Add will-change for better performance
    willChange: 'transform, opacity',
  }), [particle.size, particle.color]);

  return (
    <motion.div
      key={particle.id}
      className="absolute rounded-full pointer-events-none"
      animate={{
        left: `${particle.x}px`,
        top: `${particle.y}px`,
        opacity: particle.opacity,
      }}
      transition={{
        duration: 0.5,
        ease: "linear",
        // Disable exit animations for better performance
        exit: { duration: 0 }
      }}
      style={particleStyle}
      // Set layout=false to prevent layout animations
      layout={false}
    />
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(ParticleComponent);
