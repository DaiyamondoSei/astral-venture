
import React from 'react';
import { motion } from 'framer-motion';

interface FinalStepProps {
  step: number;
  currentStep: number;
}

const FinalStep = ({ step, currentStep }: FinalStepProps) => {
  if (step !== currentStep) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="text-2xl font-display text-white"
    >
      Now, let's step into Quanex...
    </motion.div>
  );
};

export default FinalStep;
