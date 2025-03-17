
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

// Extended types for Metatron's Cube integration
export interface ChakraNodeData {
  chakraType: ChakraType;
  level: number;
  energy: number;
  active: boolean;
  position: {
    x: number;
    y: number;
  };
}

export interface ChakraConnectionData {
  source: ChakraType;
  target: ChakraType;
  strength: number;
  active: boolean;
}

export interface ChakraVisualizationProps {
  system: ChakraSystem;
  activatedChakras: ChakraType[];
  onChakraActivated?: (chakra: ChakraType) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showLabels?: boolean;
  animationLevel?: 'none' | 'minimal' | 'standard' | 'enhanced';
}

export interface ChakraInsight {
  id: string;
  chakraType: ChakraType;
  title: string;
  description: string;
  actionItems: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface ChakraBalance {
  overallBalance: number;
  individualBalances: Record<ChakraType, number>;
  recommendations: string[];
  dominantChakra?: ChakraType;
  blockages: ChakraType[];
}

export interface ChakraInsightsOptions {
  userId?: string;
  includeRecommendations?: boolean;
  detailedAnalysis?: boolean;
  chakraTypes?: ChakraType[];
  historyDepth?: number;
}
