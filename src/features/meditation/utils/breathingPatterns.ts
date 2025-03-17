
/**
 * Breathing Patterns Utilities
 * 
 * This file contains utilities for different breathing patterns used in meditation.
 */

export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'hold-after-exhale';

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  phases: Array<{
    phase: BreathingPhase;
    duration: number; // in seconds
  }>;
  totalCycleDuration: number; // in seconds
  recommendedCycles: number;
  benefits: string[];
}

// Predefined breathing patterns
export const breathingPatterns: Record<string, BreathingPattern> = {
  'box': {
    id: 'box',
    name: 'Box Breathing',
    description: 'A technique used by Navy SEALs for focus and stress relief. Equal duration for all four phases.',
    phases: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 4 },
      { phase: 'exhale', duration: 4 },
      { phase: 'hold-after-exhale', duration: 4 }
    ],
    totalCycleDuration: 16, // 4 + 4 + 4 + 4
    recommendedCycles: 5,
    benefits: ['Reduces stress', 'Improves focus', 'Regulates autonomic nervous system']
  },
  '478': {
    id: '478',
    name: '4-7-8 Breathing',
    description: 'A relaxing pattern that helps reduce anxiety and improve sleep.',
    phases: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 7 },
      { phase: 'exhale', duration: 8 },
      { phase: 'hold-after-exhale', duration: 0 }
    ],
    totalCycleDuration: 19, // 4 + 7 + 8 + 0
    recommendedCycles: 4,
    benefits: ['Reduces anxiety', 'Helps with sleep', 'Reduces reactionary responses']
  },
  'coherent': {
    id: 'coherent',
    name: 'Coherent Breathing',
    description: 'Breathe at a rate of 5 breaths per minute for heart rate variability.',
    phases: [
      { phase: 'inhale', duration: 6 },
      { phase: 'hold', duration: 0 },
      { phase: 'exhale', duration: 6 },
      { phase: 'hold-after-exhale', duration: 0 }
    ],
    totalCycleDuration: 12, // 6 + 0 + 6 + 0
    recommendedCycles: 10,
    benefits: ['Improves heart rate variability', 'Balances autonomic nervous system', 'Reduces stress']
  },
  'energizing': {
    id: 'energizing',
    name: 'Energizing Breath',
    description: 'A stimulating breath pattern to increase energy and alertness.',
    phases: [
      { phase: 'inhale', duration: 1 },
      { phase: 'hold', duration: 0 },
      { phase: 'exhale', duration: 1 },
      { phase: 'hold-after-exhale', duration: 0 }
    ],
    totalCycleDuration: 2, // 1 + 0 + 1 + 0
    recommendedCycles: 20,
    benefits: ['Increases energy', 'Improves alertness', 'Clears mind']
  },
  'alternate-nostril': {
    id: 'alternate-nostril',
    name: 'Alternate Nostril Breathing',
    description: 'A balancing breath that calms the mind and balances the hemispheres of the brain.',
    phases: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 2 },
      { phase: 'exhale', duration: 4 },
      { phase: 'hold-after-exhale', duration: 0 }
    ],
    totalCycleDuration: 10, // 4 + 2 + 4 + 0
    recommendedCycles: 10,
    benefits: ['Balances mind', 'Reduces stress', 'Harmonizes brain hemispheres']
  }
};

// Get a specific breathing pattern by ID
export const getBreathingPattern = (id: string): BreathingPattern | undefined => {
  return breathingPatterns[id];
};

// Calculate the total session duration in seconds
export const calculateSessionDuration = (pattern: BreathingPattern): number => {
  return pattern.totalCycleDuration * pattern.recommendedCycles;
};

// Get the current phase based on the elapsed time
export const getCurrentPhase = (pattern: BreathingPattern, elapsedSeconds: number): {
  currentPhase: BreathingPhase;
  secondsInPhase: number;
  phaseProgress: number; // 0-1
} => {
  // Calculate where we are in the current cycle
  const secondsInCurrentCycle = elapsedSeconds % pattern.totalCycleDuration;
  
  let accumulatedDuration = 0;
  for (const phaseInfo of pattern.phases) {
    const nextAccumulatedDuration = accumulatedDuration + phaseInfo.duration;
    
    if (secondsInCurrentCycle < nextAccumulatedDuration) {
      const secondsInPhase = secondsInCurrentCycle - accumulatedDuration;
      const phaseProgress = secondsInPhase / phaseInfo.duration;
      
      return {
        currentPhase: phaseInfo.phase,
        secondsInPhase,
        phaseProgress
      };
    }
    
    accumulatedDuration = nextAccumulatedDuration;
  }
  
  // Shouldn't get here under normal circumstances
  return {
    currentPhase: 'inhale',
    secondsInPhase: 0,
    phaseProgress: 0
  };
};
