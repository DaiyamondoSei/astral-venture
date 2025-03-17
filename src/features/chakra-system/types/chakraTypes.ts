
/**
 * Chakra System Types
 * 
 * This file contains type definitions for the chakra system feature.
 */

// Chakra identifiers
export type ChakraType = 'crown' | 'third-eye' | 'throat' | 'heart' | 'solar' | 'sacral' | 'root';

// Chakra data structure
export interface ChakraData {
  type: ChakraType;
  name: string;
  description: string;
  color: string;
  activationLevel: number; // 0-100
  isActive: boolean;
  isBlocked: boolean;
  relatedEmotions: string[];
}

// Chakra system state
export interface ChakraSystemState {
  chakras: Record<ChakraType, ChakraData>;
  activeChakras: ChakraType[];
  overallBalance: number; // 0-100
  dominantChakra: ChakraType | null;
  energyLevel: number; // 0-100
}

// Chakra activation settings
export interface ChakraActivationOptions {
  intensity: number; // 0-100
  duration: number; // in seconds
  autoBalance: boolean;
  focusedChakras?: ChakraType[];
}

// Chakra analysis result
export interface ChakraAnalysisResult {
  dominantChakras: ChakraType[];
  blockages: Array<{
    chakra: ChakraType;
    intensity: number;
    suggestedPractices: string[];
  }>;
  overallBalance: number; // 0-100
  activationLevels: Record<ChakraType, number>;
  insights: string[];
  recommendedFocus: ChakraType[];
}
