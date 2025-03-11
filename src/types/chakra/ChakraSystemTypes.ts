
/**
 * Chakra System Types
 * 
 * Type definitions for the chakra system architecture
 */

export type ChakraType = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown';
export type EnergyLevel = 'dormant' | 'awakening' | 'active' | 'balanced' | 'heightened' | 'transcendent';
export type ActivationMethod = 'meditation' | 'breathwork' | 'movement' | 'sound' | 'visualization' | 'intention';

/**
 * Status of a specific chakra including energy levels and blockages
 */
export interface ChakraStatus {
  type: ChakraType;
  energyLevel: EnergyLevel;
  activationPercentage: number;
  blockagePercentage: number;
  dominantElement?: string;
  associatedEmotions?: string[];
  lastActivated?: string; // ISO date string
}

/**
 * Balance metrics across the chakra system
 */
export interface BalanceMetrics {
  overallBalance: number; // 0-100
  energyDistribution: Record<ChakraType, number>;
  dominantChakra?: ChakraType;
  weakestChakra?: ChakraType;
  recommendedFocus?: ChakraType[];
}

/**
 * Energy resonance patterns between chakras
 */
export interface ResonancePattern {
  sourceChakra: ChakraType;
  targetChakra: ChakraType;
  resonanceStrength: number; // 0-100
  resonanceType: 'harmonic' | 'dissonant' | 'neutral';
  visualEffect?: string;
}

/**
 * Quantum entanglement between chakras
 */
export interface EntanglementState {
  entangledChakras: [ChakraType, ChakraType][];
  entanglementStrength: number; // 0-100
  synchronicity: number; // 0-100
  coherenceField?: boolean;
}

/**
 * Superposition states in the chakra system
 */
export interface SuperpositionState {
  activeChakras: ChakraType[];
  potentialStates: Record<string, number>; // State name to probability
  waveFunction: number; // 0-100
  collapseThreshold: number;
}

/**
 * Metrics for system coherence
 */
export interface CoherenceMetrics {
  overallCoherence: number; // 0-100
  stabilityIndex: number; // 0-100
  harmonicResonance: number; // 0-100
  entropyLevel: number; // 0-100
}

/**
 * Historical record of chakra activations
 */
export interface ActivationRecord {
  timestamp: string; // ISO date string
  chakra: ChakraType;
  method: ActivationMethod;
  duration: number; // seconds
  intensity: number; // 0-100
  peakEnergy: number; // 0-100
  insights?: string[];
}

/**
 * Metrics for tracking progression over time
 */
export interface ProgressionMetrics {
  historicalBalance: Record<string, number>; // date to balance
  awakening: Record<ChakraType, number>; // 0-100
  totalActivationTime: Record<ChakraType, number>; // seconds
  milestones: string[];
}

/**
 * System performance statistics
 */
export interface PerformanceStats {
  energyEfficiency: number; // 0-100
  recoveryRate: number; // 0-100
  adaptabilityIndex: number; // 0-100
  resistanceFactors: string[];
}

/**
 * Complete chakra system configuration
 */
export interface ChakraSystem {
  // Core chakra management
  chakras: {
    activationStates: Record<ChakraType, ChakraStatus>;
    energyLevels: Record<ChakraType, EnergyLevel>;
    balanceMetrics: BalanceMetrics;
    resonancePatterns: ResonancePattern[];
  };

  // Advanced quantum features
  quantumStates?: {
    entanglement: EntanglementState;
    superposition: SuperpositionState;
    coherence: CoherenceMetrics;
  };

  // Performance & Tracking
  metrics?: {
    activationHistory: ActivationRecord[];
    progressionPath: ProgressionMetrics;
    performanceStats: PerformanceStats;
  };
}

/**
 * Component props for the ChakraSystem component
 */
export interface ChakraSystemProps {
  // Core configuration
  config?: Partial<ChakraSystem>;
  
  // Activation control
  activeChakras?: ChakraType[];
  
  // Visualization options
  showResonance?: boolean;
  showQuantumEffects?: boolean;
  detailLevel?: 'basic' | 'detailed' | 'advanced';
  
  // Events
  onChakraActivation?: (chakra: ChakraType, level: EnergyLevel) => void;
  onBalanceChange?: (metrics: BalanceMetrics) => void;
  onQuantumEvent?: (event: string, data: any) => void;
}
