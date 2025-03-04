
import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  step: number;
  currentStep: number;
}

const WelcomeStep = ({ step, currentStep }: WelcomeStepProps) => {
  if (step !== currentStep) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="mb-8"
    >
      <h2 className="text-2xl font-display text-white mb-4">Welcome, Seeker.</h2>
      <p className="text-white/80">
        Before you begin, take a breath.<br/>Let us activate your Astral Field.
      </p>
    </motion.div>
  );
};

export default WelcomeStep;
