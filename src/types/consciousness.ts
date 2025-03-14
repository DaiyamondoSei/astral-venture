
// Define a ChakraType enumeration type
export type ChakraType = 'crown' | 'third-eye' | 'throat' | 'heart' | 'solar' | 'sacral' | 'root';

// Define Chakra status to track individual chakra properties
export interface ChakraStatus {
  activation: number;
  balance: number;
  blockages: string[];
  dominantEmotions: string[];
  type?: string; // Optional type property
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
  activePairs: [number, number][] | { primaryChakra: number; secondaryChakra: number; entanglementStrength: number }[];
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

// Define consciousness metrics for tracking progress
export interface ConsciousnessMetrics {
  overallLevel: number;
  awarenessScore: number;
  insightDepth: number;
  integrationRate: number;
  lastAssessment: string;
}

// Define dream record for tracking and analysis
export interface DreamRecord {
  id: string;
  date: string;
  content: string;
  symbols: string[];
  emotions: string[];
  clarity: number;
  chakraAssociations: Record<ChakraType, number>;
  interpretation?: string;
}

// Define consciousness progression tracking
export interface ConsciousnessProgress {
  currentLevel: ConsciousnessLevel;
  progressToNextLevel: number;
  milestones: string[];
  challenges: string[];
  nextSteps: string[];
}
