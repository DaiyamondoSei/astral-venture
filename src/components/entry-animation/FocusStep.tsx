
import React from 'react';
import { motion } from 'framer-motion';

interface FocusStepProps {
  step: number;
  currentStep: number;
}

const FocusStep = ({ step, currentStep }: FocusStepProps) => {
  if (step !== currentStep) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="mb-8"
    >
      <p className="text-white/80 mb-6">
        Focus on your breath. Become aware of the energy flowing through you.
      </p>
    </motion.div>
  );
};

export default FocusStep;
