
import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

import StarsBackground from './entry-animation/StarsBackground';
import InitialOrb from './entry-animation/InitialOrb';
import WelcomeStep from './entry-animation/WelcomeStep';
import FocusStep from './entry-animation/FocusStep';
import BreathingExercise from './entry-animation/BreathingExercise';
import AstralBody from './entry-animation/AstralBody';
import FinalStep from './entry-animation/FinalStep';
import { useEntryAnimationState } from '@/hooks/useEntryAnimationState';

interface EntryAnimationProps {
  onComplete: () => void;
  className?: string;
}

const EntryAnimation = ({ onComplete, className }: EntryAnimationProps) => {
  const { animationStep, breathCount, handleBreath } = useEntryAnimationState({ onComplete });

  return (
    <div className={cn(
      "fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden",
      className
    )}>
      {/* Background stars effect */}
      <StarsBackground />
      
      <div className="relative z-10 max-w-sm mx-auto text-center">
        {/* Initial Orb */}
        <InitialOrb step={0} currentStep={animationStep} />
        
        {/* Welcome Step */}
        <WelcomeStep step={1} currentStep={animationStep} />
        
        {/* Focus Step */}
        <FocusStep step={2} currentStep={animationStep} />
        
        {/* Breathing Exercise */}
        {animationStep === 3 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              scale: breathCount === 3 ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 1 }}
          >
            <BreathingExercise 
              breathCount={breathCount} 
              onBreath={handleBreath} 
            />
          </motion.div>
        )}
        
        {/* Astral Body Activation */}
        {animationStep === 4 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <AstralBody />
          </motion.div>
        )}
        
        {/* Final Step */}
        <FinalStep step={5} currentStep={animationStep} />
      </div>
    </div>
  );
};

export default EntryAnimation;
