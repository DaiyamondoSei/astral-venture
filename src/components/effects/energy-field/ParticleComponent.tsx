
import React from 'react';
import { motion } from 'framer-motion';
import { ParticleProps } from './types';

const ParticleComponent: React.FC<ParticleProps> = ({ particle }) => {
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
        ease: "linear"
      }}
      style={{
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        backgroundColor: particle.color,
        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
      }}
    />
  );
};

export default React.memo(ParticleComponent);
