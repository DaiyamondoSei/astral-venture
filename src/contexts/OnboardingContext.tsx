
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
  progress: number;
  startOnboarding: () => void;
  skipOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  completeOnboarding: () => void;
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

  const nextStep = () => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex + 1]);
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex - 1]);
    }
  };

  const goToStep = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding-completed-${user.id}`, 'completed');
    }
    setIsActive(false);
    setHasCompletedOnboarding(true);
    
    toast({
      title: "Onboarding complete!",
      description: "Your sacred geometry journey has begun. Explore and grow.",
    });
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        isActive,
        hasCompletedOnboarding,
        progress,
        startOnboarding,
        skipOnboarding,
        nextStep,
        previousStep,
        goToStep,
        completeOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
