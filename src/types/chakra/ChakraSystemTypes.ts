
/**
 * Chakra System Types
 * 
 * This module provides types for the chakra energy system.
 */

export type ChakraType = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown';

export interface ChakraStatus {
  active: boolean;
  level: number;
  energy: number;
  blocked: boolean;
}

export interface ChakraSystem {
  chakras: Record<ChakraType, ChakraStatus>;
  activationStates: Record<ChakraType, boolean>;
  energyLevels: Record<ChakraType, number>;
  balanceMetrics: {
    overallBalance: number;
    chakraBalanceRatios: Record<ChakraType, number>;
  };
  quantumStates?: Record<string, unknown>;
  metrics?: Record<string, number>;
}

export interface ChakraSystemProps {
  system: ChakraSystem;
  energyPoints: number;
  activatedChakras: ChakraType[];
  onActivationChange?: (chakras: ChakraType[]) => void;
}

export interface ChakraActivationProps {
  chakra: ChakraType;
  activated: boolean;
  level: number;
  onActivate: (chakra: ChakraType) => void;
}
