
/**
 * Common types for onboarding step components
 */

export interface StepProps {
  onInteraction?: (interactionType: string, stepId: string) => void;
  onComplete?: () => void;
}

// Extended props for steps that require user input
export interface InputStepProps extends StepProps {
  value?: any;
  onChange?: (value: any) => void;
  errors?: Record<string, string>;
}

// Metrics for recording step completion times
export interface StepMetrics {
  stepId: string;
  startTime: number;
  endTime?: number;
  interactions: {
    type: string;
    timestamp: number;
    data?: any;
  }[];
}

// Standard step IDs for tracking
export enum StepId {
  WELCOME = 'welcome',
  ASSESSMENT = 'assessment',
  SACRED_GEOMETRY = 'sacred-geometry',
  CHAKRAS = 'chakras',
  ENERGY_POINTS = 'energy-points',
  MEDITATION = 'meditation',
  REFLECTION = 'reflection',
  COMPLETE = 'complete'
}
