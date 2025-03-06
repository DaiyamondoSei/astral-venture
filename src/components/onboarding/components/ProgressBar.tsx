
import React from 'react';
import { motion } from 'framer-motion';
import { OnboardingStep } from '@/contexts/OnboardingContext';

interface ProgressBarProps {
  currentStep: OnboardingStep;
  progress: number;
  steps: OnboardingStep[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, progress, steps }) => {
  return (
    <div className="absolute top-0 left-0 right-0">
      <div className="h-1 w-full bg-background/30">
        <motion.div 
          className="h-full bg-gradient-to-r from-quantum-400 to-quantum-600"
          initial={{ width: `${steps.indexOf(currentStep) / (steps.length - 1) * 100 - 5}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        ></motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;
