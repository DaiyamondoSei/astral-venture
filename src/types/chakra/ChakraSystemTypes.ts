
/**
 * Chakra System Types
 * Following the Type-Value Pattern for type safety
 */

// ChakraType as a string literal union
export type ChakraType = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown';

// Runtime constants for ChakraType
export const ChakraTypes = {
  ROOT: 'root' as ChakraType,
  SACRAL: 'sacral' as ChakraType,
  SOLAR: 'solar' as ChakraType,
  HEART: 'heart' as ChakraType,
  THROAT: 'throat' as ChakraType,
  THIRD_EYE: 'third-eye' as ChakraType,
  CROWN: 'crown' as ChakraType
} as const;

// ChakraStatus represents the activation state of a chakra
export interface ChakraStatus {
  activation: number;
  balance: number;
  blockages: string[];
  dominantEmotions: string[];
}

// Define a type for the chakra activation component props
export interface ChakraActivationProps {
  system?: ChakraSystem;
  energyPoints?: number;
  activatedChakras?: number[];
  onActivationChange?: (chakras: number[]) => void;
  showLabels?: boolean;
  interactive?: boolean;
  animationLevel?: 'basic' | 'enhanced' | 'minimal';
}

// EnergyLevel represents the energy flow in a chakra
export interface EnergyLevel {
  currentLevel: number;
  maxLevel: number;
  flowRate: number;
  blockagePoints: any[]; // Should be further defined for specific blockage types
}

// ChakraSystem represents the full model of the chakra system
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

// Balance metrics for the chakra system
export interface BalanceMetrics {
  overallBalance: number;
  polarityRatio: number;
  flowConsistency: number;
  balanceFactors: Record<string, number>;
}

// Resonance patterns between chakras
export interface ResonancePattern {
  primaryChakra: ChakraType;
  secondaryChakra: ChakraType;
  resonanceStrength: number;
  harmonicLevel: number;
}

// Quantum entanglement between chakras
export interface EntanglementState {
  activePairs: [ChakraType, ChakraType][];
  entanglementStrength: number;
  quantumFluctuations: number;
  stabilityFactor: number;
}

// Superposition of chakra states
export interface SuperpositionState {
  potentialStates: number[];
  collapseThreshold: number;
  observationImpact: number;
}

// Coherence of the chakra system
export interface CoherenceState {
  globalCoherence: number;
  localCoherenceFactors: Record<ChakraType, number>;
  coherenceDuration: number;
}

// Progress metrics for the chakra system
export interface ProgressionMetrics {
  activationGrowth: number;
  balanceImprovement: number;
  blockageReduction: number;
  overallProgress: number;
}

// Performance stats for the chakra system
export interface PerformanceStats {
  averageActivationTime: number;
  energyEfficiency: number;
  blockageClearanceRate: number;
}

// History of chakra activations
export interface ChakraActivationHistory {
  timestamp: number;
  chakra: ChakraType;
  activationLevel: number;
  duration: number;
}

// ChakraId as a number
export type ChakraId = number;

// VisualizationProps for chakra visualization components
export interface VisualizationProps {
  system?: ChakraSystem;
  energyPoints?: number;
  activatedChakras?: number[];
  onVisualizationRendered?: () => void;
  deviceCapability?: string;
}

// Export default so we can use this in tests
export default ChakraType;
