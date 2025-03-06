
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import OnboardingContent from './OnboardingContent';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const OnboardingOverlay: React.FC = () => {
  const { 
    isActive, 
    currentStep, 
    progress, 
    nextStep, 
    previousStep, 
    skipOnboarding,
    completeOnboarding
  } = useOnboarding();

  if (!isActive) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          // Close on background click only on certain steps
          onClick={currentStep === 'welcome' ? skipOnboarding : undefined}
        >
          <motion.div
            className="relative w-full max-w-2xl bg-background/95 backdrop-blur-md border border-quantum-500/20 rounded-lg shadow-xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={skipOnboarding}
                    className="absolute top-4 right-4 p-1 rounded-full bg-background/50 hover:bg-background/80 text-foreground/70 hover:text-foreground transition-colors z-10"
                    aria-label="Skip onboarding"
                  >
                    <X size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Skip tour</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0">
              <Progress value={progress} className="h-1 rounded-none bg-background/30" />
            </div>

            {/* Content */}
            <div className="p-6 pt-8">
              <OnboardingContent step={currentStep} />
            </div>

            {/* Navigation controls */}
            <div className="flex justify-between items-center p-4 border-t border-border/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousStep}
                disabled={currentStep === 'welcome'}
                className="flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                Back
              </Button>

              <div className="text-xs text-muted-foreground">
                Step {ONBOARDING_STEPS.indexOf(currentStep) + 1} of {ONBOARDING_STEPS.length}
              </div>

              <Button
                variant={currentStep === 'complete' ? "quantum" : "default"}
                size="sm"
                onClick={currentStep === 'complete' ? completeOnboarding : nextStep}
                className="flex items-center gap-1"
              >
                {currentStep === 'complete' ? 'Complete' : 'Next'}
                {currentStep !== 'complete' && <ChevronRight size={16} />}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// List of step IDs for easier reference
const ONBOARDING_STEPS = [
  'welcome',
  'sacred-geometry',
  'chakras',
  'energy-points',
  'meditation',
  'reflection',
  'complete'
];

export default OnboardingOverlay;
