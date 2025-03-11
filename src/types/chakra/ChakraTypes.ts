
/**
 * Core type definitions for the chakra system
 */

// Base chakra types
export type ChakraType = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third' | 'crown';

// Chakra activation status
export interface ChakraStatus {
  active: boolean;
  blockage: number; // 0-1 where 0 is no blockage
  openness: number; // 0-1 where 1 is fully open
  stability: number; // 0-1 where 1 is completely stable
}

// Chakra energy level
export interface EnergyLevel {
  current: number; // Current energy level (0-100)
  capacity: number; // Maximum capacity (0-100)
  flowRate: number; // Rate of energy flow (-10 to 10, negative is outflow)
  stability: number; // Stability of energy (0-1)
}

// Balance metrics for the entire system
export interface BalanceMetrics {
  overallBalance: number; // 0-1 where 1 is perfect balance
  energyDistribution: Record<ChakraType, number>; // Distribution pattern
  dominantChakra?: ChakraType; // Most active chakra
  weakestChakra?: ChakraType; // Least active chakra
  recommendedFocus?: ChakraType[]; // Chakras that need attention
}

// Resonance patterns between chakras
export interface ResonancePattern {
  source: ChakraType;
  target: ChakraType;
  strength: number; // 0-1 where 1 is strong resonance
  harmony: boolean; // Whether the resonance is harmonious
}

// Quantum entanglement states for advanced visualization
export interface EntanglementState {
  entanglementStrength: number; // 0-1 where 1 is complete entanglement
  entanglementPairs: Array<{
    first: ChakraType;
    second: ChakraType;
    strength: number;
  }>;
  coherence: number; // 0-1 where 1 is perfect coherence
}

// Coherence metrics for the system
export interface CoherenceMetrics {
  overallCoherence: number; // 0-1 where 1 is perfect coherence
  coherencePatterns: Record<ChakraType, number>; // Per-chakra coherence
  systemResonance: number; // Total system resonance (0-1)
  harmonicStability: number; // Stability of harmonics (0-1)
}

// Progression metrics for tracking development
export interface ProgressionMetrics {
  currentLevel: number; // Current development level
  progressToNext: number; // Progress to next level (0-1)
  totalAdvancement: number; // Total advancement (0-100)
  stagesCompleted: string[]; // Names of completed stages
}

// Performance stats for optimization
export interface PerformanceStats {
  renderTime: number; // Time to render in ms
  energyCalculationTime: number; // Time to calculate energy in ms
  memoryUsage: number; // Estimated memory usage in KB
  optimizationLevel: number; // Current optimization level (0-1)
}

// Complete chakra system state
export interface ChakraSystem {
  // Core chakra states
  chakras: {
    activationStates: Record<ChakraType, ChakraStatus>;
    energyLevels: Record<ChakraType, EnergyLevel>;
    balanceMetrics: BalanceMetrics;
    resonancePatterns: ResonancePattern[];
  };
  
  // Quantum states for advanced visualization
  quantumStates?: {
    superposition: {
      active: boolean;
      probability: number;
      potentialStates: Record<string, number>;
    };
    entanglement: EntanglementState;
    coherence: CoherenceMetrics;
  };
  
  // System-wide metrics
  metrics?: {
    progression: ProgressionMetrics;
    performance: PerformanceStats;
  };
}

// Component props for chakra visualization
export interface ChakraActivationProps {
  // Core props
  system?: ChakraSystem;
  
  // Style and behavior controls
  showLabels?: boolean;
  interactive?: boolean;
  animationLevel?: 'minimal' | 'standard' | 'enhanced';
  
  // Callbacks
  onChange?: (system: ChakraSystem) => void;
  onChakraClick?: (chakra: ChakraType) => void;
  
  // Layout and style
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}
