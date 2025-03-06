
import React from 'react';
import StepContent from './StepContent';

interface OnboardingContentProps {
  step: string;
}

const OnboardingContent: React.FC<OnboardingContentProps> = ({ step }) => {
  return (
    <div className="min-h-[300px]">
      <StepContent step={step} />
    </div>
  );
};

export default OnboardingContent;
