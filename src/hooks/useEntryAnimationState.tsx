
import { useState, useEffect } from 'react';

interface UseEntryAnimationStateProps {
  onComplete: () => void;
}

export const useEntryAnimationState = ({ onComplete }: UseEntryAnimationStateProps) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [breathCount, setBreathCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (animationStep < 3) {
        setAnimationStep(prev => prev + 1);
      } else if (animationStep === 3 && breathCount < 3) {
        // Do nothing, waiting for user to complete breaths
      } else if (animationStep === 3 && breathCount >= 3) {
        setAnimationStep(4);
        setTimeout(() => {
          setAnimationStep(5);
          setTimeout(() => {
            onComplete();
          }, 2000);
        }, 3000);
      }
    }, animationStep === 0 ? 2000 : 3000);

    return () => clearTimeout(timer);
  }, [animationStep, breathCount, onComplete]);

  const handleBreath = () => {
    if (animationStep === 3 && breathCount < 3) {
      setBreathCount(prev => prev + 1);
    }
  };

  return {
    animationStep,
    breathCount,
    handleBreath
  };
};
