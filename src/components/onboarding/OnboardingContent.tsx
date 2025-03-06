
import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import StepContent from './step-content/StepContent';

interface OnboardingContentProps {
  step: string;
}

const OnboardingContent: React.FC<OnboardingContentProps> = ({ step }) => {
  const { trackStepInteraction } = useOnboarding();
  
  const handleInteraction = (interactionType: string, stepId: string) => {
    trackStepInteraction(stepId, interactionType);
  };
  
  return (
    <div className="min-h-[300px]">
      <StepContent step={step} onInteraction={handleInteraction} />
    </div>
  );
};

export default OnboardingContent;
