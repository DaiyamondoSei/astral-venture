
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import OnboardingContent from './OnboardingContent';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

const OnboardingOverlay: React.FC = () => {
  const { 
    isActive, 
    currentStep, 
    progress, 
    nextStep, 
    previousStep, 
    skipOnboarding,
    completeOnboarding,
    hasCompletedAnyStep
  } = useOnboarding();

  if (!isActive) return null;

  // Determine if we should show the achievement animation
  const showAchievement = currentStep === 'complete' && hasCompletedAnyStep;

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
          {/* Sacred geometry background patterns */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-quantum-500/30 rounded-full"></div>
            <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 border border-quantum-400/30 rounded-full"></div>
            <div className="absolute top-[40%] left-[40%] w-1/5 h-1/5 border border-quantum-300/30 rounded-full"></div>
            
            {/* Sacred triangles */}
            <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="50,10 10,90 90,90" fill="none" stroke="rgba(120, 80, 255, 0.1)" strokeWidth="0.2" />
              <polygon points="50,15 15,85 85,85" fill="none" stroke="rgba(120, 80, 255, 0.1)" strokeWidth="0.2" />
              <polygon points="50,20 20,80 80,80" fill="none" stroke="rgba(120, 80, 255, 0.1)" strokeWidth="0.2" />
            </svg>
            
            {/* Metatron's cube hint */}
            <svg className="absolute top-[10%] right-[10%] w-1/4 h-1/4 opacity-10" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(180, 120, 255, 0.3)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(180, 120, 255, 0.3)" strokeWidth="0.5" />
              <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(180, 120, 255, 0.2)" strokeWidth="0.3" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(180, 120, 255, 0.2)" strokeWidth="0.3" />
              <line x1="15" y1="15" x2="85" y2="85" stroke="rgba(180, 120, 255, 0.2)" strokeWidth="0.3" />
              <line x1="15" y1="85" x2="85" y2="15" stroke="rgba(180, 120, 255, 0.2)" strokeWidth="0.3" />
            </svg>
          </div>

          <motion.div
            className="relative w-full max-w-2xl bg-background/95 backdrop-blur-md border border-quantum-500/20 rounded-lg shadow-xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Achievement animation */}
            <AnimatePresence>
              {showAchievement && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="flex flex-col items-center p-6 rounded-xl"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ 
                      scale: 1, 
                      rotate: 0,
                      transition: { type: "spring", bounce: 0.5, duration: 0.8 }
                    }}
                    exit={{ scale: 0, rotate: 10 }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: [0.8, 1.2, 1],
                        opacity: 1,
                        transition: { delay: 0.3, duration: 0.5 }
                      }}
                    >
                      <Award size={80} className="text-quantum-500" strokeWidth={1} />
                    </motion.div>
                    <motion.h3 
                      className="mt-4 text-2xl font-bold text-white"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                    >
                      Journey Initiated!
                    </motion.h3>
                    <motion.p
                      className="mt-2 text-white/80 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
                    >
                      You've completed the sacred geometry onboarding
                    </motion.p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

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

            {/* Progress bar with micro-animation */}
            <div className="absolute top-0 left-0 right-0">
              <div className="h-1 w-full bg-background/30">
                <motion.div 
                  className="h-full bg-gradient-to-r from-quantum-400 to-quantum-600"
                  initial={{ width: `${ONBOARDING_STEPS.indexOf(currentStep) / (ONBOARDING_STEPS.length - 1) * 100 - 5}%` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                ></motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-8">
              <OnboardingContent step={currentStep} />
            </div>

            {/* Navigation controls with accessibility improvements */}
            <div className="flex justify-between items-center p-4 border-t border-border/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousStep}
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
                {ONBOARDING_STEPS.map((step, index) => (
                  <div 
                    key={step}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      currentStep === step 
                        ? "bg-quantum-500 scale-125" 
                        : ONBOARDING_STEPS.indexOf(currentStep) > index
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
                onClick={currentStep === 'complete' ? completeOnboarding : nextStep}
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
