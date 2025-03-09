
import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface NebulaEffectProps {
  glowColor: string;
}

const NebulaEffect = memo(({ glowColor }: NebulaEffectProps) => {
  return (
    <motion.div 
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 50%)`,
        mixBlendMode: 'screen'
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.2, 0.35, 0.2]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
});

NebulaEffect.displayName = 'NebulaEffect';

export default NebulaEffect;
