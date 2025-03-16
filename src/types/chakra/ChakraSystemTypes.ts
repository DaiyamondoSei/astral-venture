
/**
 * Chakra system type definitions
 * Following the Type-Value Pattern for type safety
 */

// Chakra type identifiers
export type ChakraType = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown';

// Chakra status structure
export interface ChakraStatus {
  active: boolean;
  activationLevel: number;
  blockages: number;
  resonanceQuality: number;
  lastActivated?: Date;
}

// Energy level structure
export interface EnergyLevel {
  currentLevel: number;
  maxLevel: number;
  flowRate: number;
  blockagePoints?: Array<{ position: number; strength: number }>;
}

// Balance metrics structure
export interface BalanceMetrics {
  overallBalance: number;
  energyDistribution: Record<ChakraType, number>;
  balanceHistory?: Array<{ timestamp: number; balance: number }>;
}

// Resonance pattern structure
export interface ResonancePattern {
  pattern: string;
  strength: number;
  frequency: number;
  harmonic: boolean;
}

// Entanglement state structure
export interface EntanglementState {
  quantum: boolean;
  entanglementLevel: number;
  connectedChakras: ChakraType[];
}

// Superposition state structure
export interface SuperpositionState {
  enabled: boolean;
  probability: number;
  potentialStates: number;
}

// Performance stats structure
export interface PerformanceStats {
  renderTime: number;
  memoryUsage: number;
  optimizationLevel: number;
}

// Progression metrics structure
export interface ProgressionMetrics {
  growth: number;
  stability: number;
  adaptability: number;
}

// Complete chakra system structure
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
  };
  metrics?: {
    progression: ProgressionMetrics;
    performance: PerformanceStats;
  };
}
