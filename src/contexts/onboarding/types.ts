
export type OnboardingStep = 
  | 'welcome'
  | 'sacred-geometry'
  | 'chakras'
  | 'energy-points'
  | 'meditation'
  | 'reflection'
  | 'complete';

export interface StepInteraction {
  stepId: string;
  interactionType: string;
  timestamp: string;
}

export interface OnboardingState {
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

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'sacred-geometry',
  'chakras',
  'energy-points',
  'meditation',
  'reflection',
  'complete'
];
