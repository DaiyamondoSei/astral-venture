
/**
 * Chakra System Architecture
 * 
 * Core type definitions for the chakra system that handles
 * chakra activation, energy levels, and quantum states.
 */

// Base types
export type ChakraId = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type ChakraName = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third' | 'crown';
export type ChakraColor = string;
export type ActivationLevel = 0 | 0.2 | 0.4 | 0.6 | 0.8 | 1;

// Chakra activation state
export interface ChakraActivationState {
  id: ChakraId;
  name: ChakraName;
  active: boolean;
  activationLevel: ActivationLevel;
  blockages: number;
  resonanceQuality: number;
  lastActivated: number | null;
}

// Energy system
export interface EnergyLevel {
  chakraId: ChakraId;
  currentLevel: number;
  maxLevel: number;
  flowRate: number;
  blockagePoints: number[];
}

// Balance metrics
export interface BalanceMetrics {
  overallBalance: number;
  chakraBalanceRatios: Record<ChakraId, number>;
  harmonicResonance: number;
  stabilityIndex: number;
}

// Resonance patterns
export interface ResonancePattern {
  patternId: string;
  affectedChakras: ChakraId[];
  resonanceStrength: number;
  harmonicWaveform: string;
  activeCycles: number;
}

// Quantum state types
export interface EntanglementPair {
  primaryChakra: ChakraId;
  secondaryChakra: ChakraId;
  entanglementStrength: number;
  synchronizationRate: number;
}

export interface EntanglementState {
  activePairs: EntanglementPair[];
  entanglementMatrix: number[][];
  coherenceIndex: number;
}

export interface SuperpositionState {
  activeChakras: ChakraId[];
  potentialStates: number;
  collapseThreshold: number;
  probabilityDistribution: number[];
}

export interface CoherenceMetrics {
  overallCoherence: number;
  phaseSynchronization: number;
  quantumResonance: number;
  stabilityFactor: number;
}

// Performance and tracking
export interface ActivationRecord {
  timestamp: number;
  chakraId: ChakraId;
  activationLevel: ActivationLevel;
  duration: number;
  energyInput: number;
  energyOutput: number;
}

export interface ProgressionMetrics {
  overallProgress: number;
  chakraProgression: Record<ChakraId, number>;
  milestones: Array<{id: string; achieved: boolean; timestamp?: number}>;
  projectedGrowthRate: number;
}

export interface PerformanceStats {
  activationLatency: number;
  energyEfficiency: number;
  resonanceQuality: number;
  stateTransitionSmoothness: number;
}

// Core chakra system interface
export interface ChakraSystem {
  // Core chakra management
  chakras: {
    activationStates: ChakraActivationState[];
    energyLevels: EnergyLevel[];
    balanceMetrics: BalanceMetrics;
    resonancePatterns: ResonancePattern[];
  };

  // Advanced features
  quantumStates: {
    entanglement: EntanglementState;
    superposition: SuperpositionState;
    coherence: CoherenceMetrics;
  };

  // Performance & Tracking
  metrics: {
    activationHistory: ActivationRecord[];
    progressionPath: ProgressionMetrics;
    performanceStats: PerformanceStats;
  };
}

// Component props for the chakra system
export interface ChakraSystemProps {
  system?: Partial<ChakraSystem>;
  energyPoints: number;
  activatedChakras?: number[];
  onActivationChange?: (activatedChakras: number[]) => void;
  className?: string;
}
