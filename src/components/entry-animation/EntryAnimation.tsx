
import React from 'react';
import { motion } from 'framer-motion';
import StarsBackground from './StarsBackground';
import AstralBody from './AstralBody';
import { useEntryStepNavigation } from './hooks/useEntryStepNavigation';
import { WelcomeStep, FocusStep, FinalStep, BreathingExercise } from './steps';

interface EntryAnimationProps {
  onComplete?: () => void;
}

const EntryAnimation = ({ onComplete }: EntryAnimationProps) => {
  const {
    currentStep,
    breathCount,
    prefersReducedMotion,
    handleBreath
  } = useEntryStepNavigation({ onComplete });
  
  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" 
      role="region" 
      aria-label="Guided entry meditation experience"
    >
      <StarsBackground />
      
      <motion.div 
        className="z-10 text-center px-6 max-w-lg"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 1 }}
      >
        <WelcomeStep step={1} currentStep={currentStep} />
        
        {currentStep === 2 && (
          <>
            <FocusStep step={2} currentStep={currentStep} />
            <BreathingExercise 
              breathCount={breathCount} 
              onBreath={handleBreath} 
            />
          </>
        )}
        
        {currentStep === 3 && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            animate={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 1 }}
          >
            <AstralBody />
          </motion.div>
        )}
        
        <FinalStep step={4} currentStep={currentStep} />
      </motion.div>
    </div>
  );
};

export default EntryAnimation;
