
import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TourStep } from './types';

interface TooltipContentProps {
  currentStep: TourStep;
  currentStepIndex: number;
  stepsCount: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onComplete: () => void;
}

const TooltipContent: React.FC<TooltipContentProps> = ({
  currentStep,
  currentStepIndex,
  stepsCount,
  onPrevStep,
  onNextStep,
  onComplete
}) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-foreground">{currentStep.title}</h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onComplete}
        >
          <X size={14} />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mb-4">{currentStep.content}</p>
      
      {/* Tour progress indicator */}
      <div className="mb-2 text-xs text-muted-foreground">
        Step {currentStepIndex + 1} of {stepsCount}
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {Array.from({ length: stepsCount }).map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full ${
                index === currentStepIndex
                  ? 'bg-quantum-500'
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onPrevStep}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onNextStep}
          >
            {currentStepIndex < stepsCount - 1 ? <ChevronRight size={16} /> : <X size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TooltipContent;
