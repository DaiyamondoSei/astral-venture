
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTooltipPosition } from './useTooltipPosition';
import { useElementHighlight } from './useElementHighlight';
import PositionIndicator from './PositionIndicator';
import TooltipContent from './TooltipContent';
import { GuidedTourProps } from './types';

const GuidedTour: React.FC<GuidedTourProps> = ({
  tourId,
  title,
  description,
  steps,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const currentStep = steps[currentStepIndex];
  
  const { position, tooltipPosition, tooltipRef } = useTooltipPosition(currentStep);
  
  // Apply highlighting to the target element
  useElementHighlight(currentStep);
  
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };
  
  if (!currentStep) return null;
  
  return (
    <motion.div
      ref={tooltipRef}
      className="fixed z-[1001] bg-background border border-quantum-500/30 rounded-lg shadow-lg w-72"
      style={{ 
        top: position.top,
        left: position.left,
        transform: 'translate(0, 0)'
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Position indicator triangle */}
      <PositionIndicator position={tooltipPosition} />
      
      {/* Content */}
      <TooltipContent
        currentStep={currentStep}
        currentStepIndex={currentStepIndex}
        stepsCount={steps.length}
        onPrevStep={handlePrevStep}
        onNextStep={handleNextStep}
        onComplete={onComplete}
      />
    </motion.div>
  );
};

export default GuidedTour;
