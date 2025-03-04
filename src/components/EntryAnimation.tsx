
import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import GlowEffect from '@/components/GlowEffect';
import StarsBackground from './entry-animation/StarsBackground';
import WelcomeStep from './entry-animation/WelcomeStep';
import FocusStep from './entry-animation/FocusStep';
import BreathingExercise from './entry-animation/BreathingExercise';
import AstralBody from './entry-animation/AstralBody';
import FinalStep from './entry-animation/FinalStep';

interface EntryAnimationProps {
  onComplete?: () => void;
}

const EntryAnimation = ({ onComplete }: EntryAnimationProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [breathCount, setBreathCount] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = useReducedMotion();
  
  useEffect(() => {
    // Skip directly to final step if user prefers reduced motion
    if (prefersReducedMotion) {
      setCurrentStep(4);
      
      const completionTimer = setTimeout(() => {
        setAnimationComplete(true);
        if (onComplete) {
          onComplete();
        }
      }, 3000);
      
      return () => clearTimeout(completionTimer);
    }
    
    // Start with welcome message for users without motion preferences
    const timer = setTimeout(() => {
      if (currentStep === 1) {
        setCurrentStep(2); // Move to focus step
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentStep, onComplete, prefersReducedMotion]);
  
  useEffect(() => {
    // When breath exercise is complete
    if (breathCount >= 3 && currentStep === 2) {
      setCurrentStep(3); // Move to astral body visualization
      
      // After showing astral body, move to final step
      const timer = setTimeout(() => {
        setCurrentStep(4);
        
        // After final message, complete the animation
        const completionTimer = setTimeout(() => {
          setAnimationComplete(true);
          if (onComplete) {
            onComplete();
          }
        }, 3000);
        
        return () => clearTimeout(completionTimer);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [breathCount, currentStep, onComplete]);
  
  const handleBreath = () => {
    setBreathCount(prev => prev + 1);
  };
  
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
