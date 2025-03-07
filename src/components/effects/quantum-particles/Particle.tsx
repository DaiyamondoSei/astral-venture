
import React from 'react';
import { motion } from 'framer-motion';
import { QuantumParticle } from './types';

interface ParticleProps {
  particle: QuantumParticle;
  dx: number;
  dy: number;
}

const Particle: React.FC<ParticleProps> = ({ particle, dx, dy }) => {
  return (
    <motion.div
      key={particle.id}
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

export default React.memo(Particle);
