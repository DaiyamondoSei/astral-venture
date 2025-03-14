
// Define a ChakraType enumeration type
export type ChakraType = 'crown' | 'third-eye' | 'throat' | 'heart' | 'solar' | 'sacral' | 'root';

// Define Chakra status to track individual chakra properties
export interface ChakraStatus {
  activation: number;
  balance: number;
  blockages: string[];
  dominantEmotions: string[];
}

// Define system for tracking overall chakra health
export interface ChakraSystem {
  chakras: Record<ChakraType, ChakraStatus>;
  overallBalance: number;
  dominantChakra: ChakraType | null;
  lastUpdated: string;
}

// Define entanglement state for quantum effects
export interface EntanglementState {
  activePairs: [number, number][];
  entanglementStrength: number;
  quantumFluctuations: boolean;
  stabilityFactor: number;
}

// Define consciousness level progression
export type ConsciousnessLevel = 'awakening' | 'expanding' | 'integrating' | 'transcending' | 'cosmic';

// Define emotional profile for a user
export interface EmotionalProfile {
  dominantEmotions: string[];
  emotionalClarity: number;
  traumaPatterns: string[];
  emotionalMaturity: number;
}

// Define user energy data including chakras and consciousness
export interface UserEnergyData {
  chakraSystem: ChakraSystem;
  consciousnessLevel: ConsciousnessLevel;
  energyPoints: number;
  lastActivities: string[];
  emotionalProfile: EmotionalProfile;
}
