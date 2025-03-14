
import { ChakraType, ChakraStatus, EntanglementState } from '@/types/consciousness';

// Define ChakraSystemProps for consistency across components
export interface ChakraSystemProps {
  system?: any;
  energyPoints?: number;
  activatedChakras?: number[];
  onActivationChange?: (activatedChakras: number[]) => void;
  activePairs?: Array<[number, number] | { primaryChakra: number; secondaryChakra: number; entanglementStrength: number; }>;
}

// Additional types needed for the ChakraSystem
export interface ChakraActivationState {
  chakraId: number;
  active: boolean;
  activationLevel: number;
  lastActivated?: string;
  activationHistory?: { timestamp: string; level: number }[];
}

export interface EnergyLevel {
  currentLevel: number;
  maxLevel: number;
  flowRate: number;
  blockagePoints: any[];
}

export interface BalanceMetrics {
  overallBalance: number;
  energyDistribution: Record<ChakraType, number>;
  dominantChakra?: ChakraType;
  weakestChakra?: ChakraType;
  recommendedFocus?: ChakraType[];
  chakraBalanceRatios?: Record<number, number>;
}

export interface ResonancePattern {
  sourceChakra: number;
  targetChakra: number;
  resonanceStrength: number;
  harmonicQuality: number;
}

export interface CoherenceMetrics {
  overallCoherence: number;
  chakraPairCoherence: Record<string, number>;
  coherenceHistory: { timestamp: string; value: number }[];
  phaseSynchronization?: Record<string, number>;
}

export interface SuperpositionState {
  potentialStates: Record<string, number> | number;
  stateAmplitudes: Record<string, number>;
  waveFunction: any[];
  collapseThreshold: number;
}

export interface ProgressionMetrics {
  currentStage: string;
  progressToNextStage: number;
  stageHistory: { stage: string; achievedAt: string }[];
  overallProgress?: number;
}

export interface PerformanceStats {
  renderTime: number;
  optimizationLevel: number;
  memoryUsage: number;
  activationLatency?: Record<number, number>;
}

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
    coherence: CoherenceMetrics;
  };
  metrics?: {
    progression: ProgressionMetrics;
    performance: PerformanceStats;
  };
}

// Define MetatronsNode and MetatronsConnection types
export interface MetatronsNode {
  id: string;
  x: number;
  y: number;
  chakraIndex?: number;
  active?: boolean;
  state?: string;
}

export interface MetatronsConnection {
  id: string;
  source: string;
  target: string;
  active?: boolean;
  intensity?: number;
  animated?: boolean;
}

// Add the GlassmorphicVariant type to support the missing variants in errors
export type GlassmorphicVariant = 'default' | 'quantum' | 'ethereal' | 'elevated' | 'subtle' | 'medium' | 'cosmic' | 'purple';

// Metatron's Cube types for type errors
export type CubeTheme = 'default' | 'light' | 'dark' | 'cosmic' | 'chakra' | 'etheric';
export type CubeSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type GlowIntensity = 'high' | 'medium' | 'low' | 'none';

export interface MetatronsCubeData {
  nodes: MetatronsNode[];
  connections: MetatronsConnection[];
}

export interface VisualizationProps {
  system?: ChakraSystem;
  energyPoints?: number;
  activatedChakras?: number[];
  onActivationChange?: (activatedChakras: number[]) => void;
  onVisualizationRendered?: () => void;
  deviceCapability?: string;
}
