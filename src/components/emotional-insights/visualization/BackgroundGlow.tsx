
import React from 'react';
import { motion } from 'framer-motion';

interface BackgroundGlowProps {
  emotionalGrowth: number;
  glowIntensity: number;
}

const BackgroundGlow: React.FC<BackgroundGlowProps> = ({ 
  emotionalGrowth, 
  glowIntensity 
}) => {
  return (
    <motion.div 
      className="absolute inset-0 rounded-lg"
      animate={{
        boxShadow: `inset 0 0 ${20 + (emotionalGrowth / 10)}px rgba(138, 92, 246, ${glowIntensity})`
      }}
      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
    />
  );
};

export default BackgroundGlow;
