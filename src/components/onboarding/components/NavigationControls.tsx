
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingStep } from '@/contexts/OnboardingContext';

interface NavigationControlsProps {
  currentStep: OnboardingStep;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  steps: OnboardingStep[];
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentStep,
  onPrevious,
  onNext,
  onComplete,
  steps
}) => {
  return (
    <div className="flex justify-between items-center p-4 border-t border-border/30">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrevious}
        disabled={currentStep === 'welcome'}
        className={cn(
          "flex items-center gap-1 transition-transform",
          currentStep !== 'welcome' && "hover:translate-x-[-2px]"
        )}
        aria-label="Go to previous step"
      >
        <ChevronLeft size={16} />
        <span>Back</span>
      </Button>

      {/* Step indicator with enhanced visuals */}
      <div className="flex items-center gap-1.5">
        {steps.map((step, index) => (
          <div 
            key={step}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentStep === step 
                ? "bg-quantum-500 scale-125" 
                : steps.indexOf(currentStep) > index
                  ? "bg-quantum-400/80"
                  : "bg-quantum-800/40"
            )}
            aria-hidden="true"
          />
        ))}
      </div>

      <Button
        variant={currentStep === 'complete' ? "quantum" : "default"}
        size="sm"
        onClick={currentStep === 'complete' ? onComplete : onNext}
        className={cn(
          "flex items-center gap-1 transition-transform",
          "hover:translate-x-[2px]",
          currentStep === 'complete' && "animate-pulse"
        )}
        aria-label={currentStep === 'complete' ? "Complete onboarding" : "Go to next step"}
      >
        <span>{currentStep === 'complete' ? 'Complete' : 'Next'}</span>
        {currentStep !== 'complete' && <ChevronRight size={16} />}
      </Button>
    </div>
  );
};

export default NavigationControls;
