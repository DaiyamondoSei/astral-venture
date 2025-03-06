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

interface StepInteraction {
  stepId: string;
  interactionType: string;
  timestamp: string;
}

interface OnboardingState {
  currentStep: OnboardingStep;
  isActive: boolean;
  hasCompletedOnboarding: boolean;
  hasCompletedAnyStep: boolean;
  progress: number;
  completedSteps: Record<string, boolean>;
  stepInteractions: StepInteraction[];
  startOnboarding: () => void;
  skipOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
  trackStepInteraction: (stepId: string, interactionType: string) => void;
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
  const [stepInteractions, setStepInteractions] = useState<StepInteraction[]>([]);

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

  const trackStepInteraction = (stepId: string, interactionType: string) => {
    const newInteraction = {
      stepId,
      interactionType,
      timestamp: new Date().toISOString()
    };
    
    setStepInteractions(prev => [...prev, newInteraction]);
    
    if (interactionType.includes('clicked') || interactionType.includes('selected')) {
      toast({
        title: "Exploration in progress",
        description: "You're discovering deeper aspects of your spiritual journey.",
        variant: "default",
      });
    }
    
    if (user) {
      const storedInteractions = JSON.parse(localStorage.getItem(`onboarding-interactions-${user.id}`) || '[]');
      localStorage.setItem(
        `onboarding-interactions-${user.id}`, 
        JSON.stringify([...storedInteractions, newInteraction])
      );
    }
  };

  const nextStep = () => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      saveCompletedStep(currentStep);
      
      const nextStep = ONBOARDING_STEPS[currentIndex + 1];
      setCurrentStep(nextStep);
      
      trackStepInteraction(currentStep, 'completed');
      
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
      const allSteps = ONBOARDING_STEPS.reduce((acc, step) => {
        if (step !== 'complete') {
          acc[step] = true;
        }
        return acc;
      }, {} as Record<string, boolean>);
      
      setCompletedSteps(allSteps);
      localStorage.setItem(`onboarding-steps-${user.id}`, JSON.stringify(allSteps));
      localStorage.setItem(`onboarding-completed-${user.id}`, 'completed');
      
      trackStepInteraction('complete', 'onboarding_completed');
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
          stepInteractions,
          startOnboarding,
          skipOnboarding,
          nextStep,
          previousStep,
          goToStep,
          completeOnboarding,
          restartOnboarding,
          trackStepInteraction
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
