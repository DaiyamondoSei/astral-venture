
import React from 'react';
import { motion } from 'framer-motion';
import GlowEffect from '@/components/GlowEffect';

interface InitialOrbProps {
  step: number;
  currentStep: number;
}

const InitialOrb = ({ step, currentStep }: InitialOrbProps) => {
  if (step > currentStep) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: step === currentStep ? 1 : 0, scale: step === currentStep ? 1 : 0.5 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <GlowEffect 
        className="w-24 h-24 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-700"
        animation="pulse"
        color="rgba(138, 92, 246, 0.8)"
        intensity="medium"
      />
    </motion.div>
  );
};

export default InitialOrb;
