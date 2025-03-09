
/**
 * Common types for onboarding step components
 */

export interface StepProps {
  onInteraction?: (interactionType: string, stepId: string) => void;
  onComplete?: () => void;
}
