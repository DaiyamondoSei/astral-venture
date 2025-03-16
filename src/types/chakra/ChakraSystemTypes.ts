
/**
 * Chakra system type definitions
 * Following the Type-Value Pattern
 */

// Chakra type (positions)
export type ChakraType = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown';

// Chakra status interface
export interface ChakraStatus {
  active: boolean;
  blocked: boolean;
  activation: number;
  resonance: number;
}

// Energy level interface
export interface EnergyLevel {
  current: number;
  max: number;
  flowRate: number;
}

// Chakra system interface with improved type safety
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

// Balance metrics interface
export interface BalanceMetrics {
  overall: number;
  upperLower: number;
  leftRight: number;
  frontBack: number;
  chakraBalanceRatios?: Record<ChakraType, number>;
}

// Resonance pattern interface
export interface ResonancePattern {
  source: ChakraType;
  target: ChakraType;
  strength: number;
}

// Entanglement state interface
export interface EntanglementState {
  level: number;
  stability: number;
  activePairs?: [ChakraType, ChakraType][];
}

// Superposition state interface
export interface SuperpositionState {
  level: number;
  volatility: number;
  activeChakras?: ChakraType[];
}

// Coherence state interface
export interface CoherenceState {
  level: number;
  harmony: number;
}

// Performance stats interface
export interface PerformanceStats {
  renderTime: number;
  updateFrequency: number;
  optimizationLevel: number;
}

// Progression metrics interface
export interface ProgressionMetrics {
  chakraGrowth: Record<ChakraType, number>;
  systemComplexity: number;
  evolutionRate: number;
}

// Chakra activation history interface
export interface ChakraActivationHistory {
  timestamp: number;
  chakra: ChakraType;
  activationLevel: number;
}

// Chakra activation props for components
export interface ChakraActivationProps {
  chakras?: Record<ChakraType, number>;
  showLabels?: boolean;
  interactive?: boolean;
  animationLevel?: 'minimal' | 'standard' | 'enhanced';
  system?: string;
  energyPoints?: number;
  activatedChakras?: number[];
  onActivationChange?: (activatedChakras: number[]) => void;
}

// Chakra visualization props
export interface VisualizationProps {
  chakras?: Record<ChakraType, number>;
  showEffects?: boolean;
  theme?: string;
  quality?: 'low' | 'medium' | 'high';
  system?: string;
  energyPoints?: number;
  activatedChakras?: number[];
  onVisualizationRendered?: () => void;
  deviceCapability?: string;
}
