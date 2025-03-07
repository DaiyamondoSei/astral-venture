
import React from 'react';
import { motion } from 'framer-motion';
import { QuantumParticle } from './types';

interface ParticleProps {
  particle: QuantumParticle;
  dx: number;
  dy: number;
}

// Using React.memo to prevent unnecessary re-renders
const Particle: React.FC<ParticleProps> = ({ particle, dx, dy }) => {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        backgroundColor: particle.color,
        opacity: particle.opacity,
      }}
      animate={{
        x: [0, dx * 10, 0],
        y: [0, dy * 10, 0],
        scale: [1, 1.2, 1],
        opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
      }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: particle.duration,
        delay: particle.delay,
        ease: "easeInOut"
      }}
    />
  );
};

// Export with React.memo to prevent unnecessary re-renders when props don't change
export default React.memo(Particle);
