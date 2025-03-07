
import React from 'react';
import { motion } from 'framer-motion';
import { ClickWaveProps } from './types';

const ClickWave: React.FC<ClickWaveProps> = ({ clickWave }) => {
  if (!clickWave || !clickWave.active) return null;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: clickWave.x,
        top: clickWave.y,
        backgroundColor: 'transparent',
        border: '2px solid rgba(255, 255, 255, 0.6)',
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ width: 0, height: 0, opacity: 1 }}
      animate={{ 
        width: 200, 
        height: 200, 
        opacity: 0,
        borderColor: ['rgba(255, 255, 255, 0.6)', 'rgba(138, 92, 246, 0)']
      }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
  );
};

export default React.memo(ClickWave);
