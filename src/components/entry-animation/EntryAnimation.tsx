
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarsBackground from './StarsBackground';
import InitialOrb from './InitialOrb';
import AstralBody from './AstralBody';
import CosmicAstralBody from './CosmicAstralBody';
import { 
  WelcomeStep, 
  FocusStep, 
  BreathingExercise, 
  FinalStep 
} from './steps';

interface EntryAnimationProps {
  step?: number;
  onStepComplete?: () => void;
  onComplete?: () => void;
}

const EntryAnimation: React.FC<EntryAnimationProps> = ({
  step = 0,
  onStepComplete,
  onComplete,
}) => {
  const [internalStep, setInternalStep] = useState(step);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    setInternalStep(step);
  }, [step]);

  const handleStepComplete = () => {
    if (onStepComplete) {
      onStepComplete();
    } else {
      // Auto-advance if no external control
      setInternalStep(prev => prev + 1);
    }
  };

  const handleComplete = () => {
    setAnimationComplete(true);
    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  const renderStep = () => {
    switch (internalStep) {
      case 0:
        return <WelcomeStep onNext={handleStepComplete} />;
      case 1:
        return <FocusStep onNext={handleStepComplete} />;
      case 2:
        return <BreathingExercise onNext={handleStepComplete} />;
      case 3:
        return <FinalStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full">
      <StarsBackground />
      
      <AnimatePresence>
        {internalStep < 2 && (
          <motion.div 
            key="initialOrb"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: internalStep === 0 ? 1 : 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <InitialOrb pulsating={internalStep === 0} />
          </motion.div>
        )}
        
        {internalStep >= 1 && internalStep < 3 && (
          <motion.div
            key="astralBody"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <AstralBody activated={internalStep >= 2} />
          </motion.div>
        )}
        
        {internalStep >= 3 && (
          <motion.div
            key="cosmicBody"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <CosmicAstralBody />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {renderStep()}
      </div>
    </div>
  );
};

export default EntryAnimation;
