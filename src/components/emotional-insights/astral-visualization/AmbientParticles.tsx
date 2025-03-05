
import React from 'react';
import { motion } from 'framer-motion';

interface AmbientParticlesProps {
  transitionedGrowth: number;
}

const AmbientParticles: React.FC<AmbientParticlesProps> = ({ transitionedGrowth }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: Math.floor(transitionedGrowth / 15) }, (_, i) => (
        <motion.div
          key={`ambient-particle-${i}`}
          className="absolute w-1 h-1 bg-white/70 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0, 1 + (transitionedGrowth / 100), 0],
            x: [0, (Math.random() - 0.5) * 30],
            y: [0, (Math.random() - 0.5) * 30],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default AmbientParticles;
