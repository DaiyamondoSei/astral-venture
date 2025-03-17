
/**
 * Chakra system type definitions
 * Following the Type-Value Pattern for type safety
 */

// Chakra types
export type ChakraType = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown';

// Chakra constants
export const ChakraTypes = {
  ROOT: 'root' as ChakraType,
  SACRAL: 'sacral' as ChakraType,
  SOLAR: 'solar' as ChakraType,
  HEART: 'heart' as ChakraType,
  THROAT: 'throat' as ChakraType,
  THIRD_EYE: 'third-eye' as ChakraType,
  CROWN: 'crown' as ChakraType
};

// ChakraID is a numeric identifier for chakras (0-based index)
export type ChakraId = number;

// Activation level for chakras (0-10 scale)
export type ActivationLevel = number;

// Chakra status structure
export interface ChakraStatus {
  activation: number;
  balance: number;
  blockages: string[];
  dominantEmotions: string[];
}

// Energy level structure
export interface EnergyLevel {
  currentLevel: number;
  maxLevel: number;
  flowRate: number;
}

// Balance metrics
export interface BalanceMetrics {
  overallBalance: number;
  polarityRatio: number;
  flowConsistency: number;
  balanceFactors: Record<string, number>;
}

// Resonance pattern
export interface ResonancePattern {
  chakras: ChakraType[];
  strength: number;
  frequency: number;
  harmonicQuality: number;
}

// Entanglement state
export interface EntanglementState {
  activePairs: [ChakraType, ChakraType][];
  entanglementStrength: number;
  entanglementMatrix: Record<string, number>;
  quantumFluctuations: number;
  stabilityFactor: number;
  overallCoherence: number;
}

// Superposition state
export interface SuperpositionState {
  potentialStates: number[];
  probabilityDistribution: number[];
  collapseThreshold: number;
  waveFunction: number[];
}

// Coherence state
export interface CoherenceState {
  individualCoherence: Record<ChakraType, number>;
  pairCoherence: Record<string, number>;
  globalCoherence: number;
  overallCoherence: number;
}

// Progress metrics
export interface ProgressionMetrics {
  activationProgress: Record<ChakraType, number>;
  balanceProgress: Record<ChakraType, number>;
  alignmentScore: number;
  evolutionRate: number;
  overallProgress: number;
}

// Performance stats
export interface PerformanceStats {
  energyEfficiency: number;
  responseTime: number;
  recoveryRate: number;
  adaptability: number;
}

// Activation history
export interface ChakraActivationHistory {
  timestamp: number;
  chakraType: ChakraType;
  activationChange: number;
  balanceChange: number;
  triggerEvent?: string;
}

// Complete chakra system state
export interface ChakraSystem {
  chakras: {
    activationStates: Record<ChakraType, ChakraStatus>;
    energyLevels: Record<ChakraType, EnergyLevel>;
    balanceMetrics: BalanceMetrics;
    resonancePatterns: ResonancePattern[];
  };
  quantumStates: {
    entanglement: EntanglementState;
    superposition: SuperpositionState;
    coherence: CoherenceState;
  };
  metrics?: {
    progression: ProgressionMetrics;
    performance: PerformanceStats;
    activationHistory?: ChakraActivationHistory[];
  };
}

// Chakra Activation Component Props
export interface ChakraActivationProps {
  system: ChakraSystem;
  energyPoints: number;
  activatedChakras: number[];
  onActivationChange?: (activatedChakras: number[]) => void;
}

// Visualization Component Props
export interface VisualizationProps {
  system: ChakraSystem;
  energyPoints: number;
  activatedChakras: number[];
  onVisualizationRendered?: () => void;
  deviceCapability?: string;
}
