
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

type OnboardingStep = 
  | 'welcome'
  | 'sacred-geometry'
  | 'chakras'
  | 'energy-points'
  | 'meditation'
  | 'reflection'
  | 'complete';

interface OnboardingState {
  currentStep: OnboardingStep;
  isActive: boolean;
  hasCompletedOnboarding: boolean;
  hasCompletedAnyStep: boolean;
  progress: number;
  completedSteps: Record<string, boolean>;
  startOnboarding: () => void;
  skipOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingState | undefined>(undefined);

const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'sacred-geometry',
  'chakras',
  'energy-points',
  'meditation',
  'reflection',
  'complete'
];

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isActive, setIsActive] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [hasCompletedAnyStep, setHasCompletedAnyStep] = useState(false);

  // Load onboarding state from localStorage on mount
  useEffect(() => {
    if (user) {
      const completedOnboarding = localStorage.getItem(`onboarding-completed-${user.id}`);
      if (completedOnboarding) {
        setHasCompletedOnboarding(true);
      } else {
        // Check if we should auto-start onboarding for new users
        const hasVisited = localStorage.getItem('hasVisitedQuanex');
        if (!hasVisited) {
          // Only auto-start if they've gone through dream capture and entry animation
          const dreamCaptureCompleted = localStorage.getItem('dreamCaptureCompleted');
          const entryAnimationCompleted = localStorage.getItem(`entry-animation-shown-${user.id}`);
          
          if (dreamCaptureCompleted && entryAnimationCompleted) {
            setIsActive(true);
          }
        }
      }

      // Load completed steps
      const savedCompletedSteps = localStorage.getItem(`onboarding-steps-${user.id}`);
      if (savedCompletedSteps) {
        const parsedSteps = JSON.parse(savedCompletedSteps);
        setCompletedSteps(parsedSteps);
        
        // Check if any steps have been completed
        if (Object.keys(parsedSteps).length > 0) {
          setHasCompletedAnyStep(true);
        }
      }
    }
  }, [user]);

  // Calculate progress percentage based on current step
  const progress = ONBOARDING_STEPS.indexOf(currentStep) / (ONBOARDING_STEPS.length - 1) * 100;

  const startOnboarding = () => {
    setIsActive(true);
    setCurrentStep('welcome');
    
    toast({
      title: "Welcome to your sacred journey",
      description: "Let's explore the cosmic wisdom of sacred geometry together.",
    });
  };

  const skipOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding-completed-${user.id}`, 'skipped');
    }
    setIsActive(false);
    setHasCompletedOnboarding(true);
    
    toast({
      title: "Onboarding skipped",
      description: "You can restart the guided tour anytime from settings.",
    });
  };

  const saveCompletedStep = (step: OnboardingStep) => {
    if (user && step !== 'welcome') {
      const updatedSteps = { ...completedSteps, [step]: true };
      setCompletedSteps(updatedSteps);
      localStorage.setItem(`onboarding-steps-${user.id}`, JSON.stringify(updatedSteps));
      setHasCompletedAnyStep(true);
    }
  };

  const nextStep = () => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      // Mark the current step as completed before moving to the next
      saveCompletedStep(currentStep);
      
      // Move to next step
      const nextStep = ONBOARDING_STEPS[currentIndex + 1];
      setCurrentStep(nextStep);
      
      // Announce for screen readers
      const announcer = document.getElementById('a11y-announcer');
      if (announcer) {
        announcer.textContent = `Moved to step ${currentIndex + 2} of ${ONBOARDING_STEPS.length}: ${nextStep.replace('-', ' ')}`;
      }
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex - 1]);
      
      // Announce for screen readers
      const announcer = document.getElementById('a11y-announcer');
      if (announcer) {
        announcer.textContent = `Moved to step ${currentIndex} of ${ONBOARDING_STEPS.length}: ${ONBOARDING_STEPS[currentIndex - 1].replace('-', ' ')}`;
      }
    }
  };

  const goToStep = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  const completeOnboarding = () => {
    if (user) {
      // Save all steps as completed
      const allSteps = ONBOARDING_STEPS.reduce((acc, step) => {
        if (step !== 'complete') {
          acc[step] = true;
        }
        return acc;
      }, {} as Record<string, boolean>);
      
      setCompletedSteps(allSteps);
      localStorage.setItem(`onboarding-steps-${user.id}`, JSON.stringify(allSteps));
      localStorage.setItem(`onboarding-completed-${user.id}`, 'completed');
    }
    
    setIsActive(false);
    setHasCompletedOnboarding(true);
    
    toast({
      title: "Onboarding complete!",
      description: "Your sacred geometry journey has begun. Explore and grow.",
      variant: "default"
    });
  };

  const restartOnboarding = () => {
    setCurrentStep('welcome');
    setIsActive(true);
    
    toast({
      title: "Restarting your sacred journey",
      description: "Let's revisit the cosmic wisdom together.",
    });
  };

  return (
    <>
      {/* Accessibility announcer for screen readers */}
      <div 
        id="a11y-announcer" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      ></div>
      
      <OnboardingContext.Provider
        value={{
          currentStep,
          isActive,
          hasCompletedOnboarding,
          hasCompletedAnyStep,
          progress,
          completedSteps,
          startOnboarding,
          skipOnboarding,
          nextStep,
          previousStep,
          goToStep,
          completeOnboarding,
          restartOnboarding
        }}
      >
        {children}
      </OnboardingContext.Provider>
    </>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
