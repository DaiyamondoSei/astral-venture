
import { useState, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

interface UseEntryStepNavigationProps {
  onComplete?: () => void;
}

export const useEntryStepNavigation = ({ onComplete }: UseEntryStepNavigationProps) => {
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
  
  return {
    currentStep,
    breathCount,
    animationComplete,
    prefersReducedMotion,
    handleBreath
  };
};
