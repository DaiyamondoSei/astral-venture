
/**
 * Types for the chakra system
 */

/**
 * Represents a single chakra
 */
export interface ChakraData {
  id: string;
  name: string;
  color: string;
  activationLevel: number;
  position: number;
  description?: string;
  element?: string;
  associatedGlands?: string[];
  associatedOrgans?: string[];
}

/**
 * Represents a complete chakra system
 */
export interface ChakraSystemData {
  id: string;
  userId: string;
  chakras: ChakraData[];
  dominantChakra: string;
  overallBalance: number;
  lastUpdated: string;
  history?: ChakraHistoryEntry[];
}

/**
 * A single history entry for chakra system changes
 */
export interface ChakraHistoryEntry {
  date: string;
  chakras: {
    id: string;
    activationLevel: number;
  }[];
  overallBalance: number;
}

/**
 * Chakra activity that can affect chakra levels
 */
export interface ChakraActivity {
  id: string;
  name: string;
  description?: string;
  primaryChakra: string;
  secondaryChakras?: string[];
  activationEffect: number;
  duration: number;
}

/**
 * Chakra meditation session
 */
export interface ChakraMeditationSession {
  id: string;
  userId: string;
  date: string;
  duration: number;
  targetChakras: string[];
  activationChanges: {
    chakraId: string;
    before: number;
    after: number;
  }[];
  notes?: string;
}
