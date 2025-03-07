
import React from 'react';
import { motion } from 'framer-motion';

export interface ClickWaveProps {
  x: number;
  y: number;
  color: string;
}

const ClickWave: React.FC<ClickWaveProps> = ({ x, y, color }) => {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        backgroundColor: color,
        transformOrigin: 'center center',
      }}
      initial={{ width: 0, height: 0, opacity: 0.7 }}
      animate={{ 
        width: 150, 
        height: 150, 
        opacity: 0,
        x: -75,
        y: -75,
      }}
      transition={{ duration: 1, ease: 'easeOut' }}
      exit={{ opacity: 0 }}
    />
  );
};

export default React.memo(ClickWave);
