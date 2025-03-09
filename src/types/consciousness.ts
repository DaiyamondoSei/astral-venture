
/**
 * Core Consciousness Data Types
 * These types define the structure for consciousness metrics, dream storage, and chakra activation.
 */

// Consciousness Levels and States
export type ConsciousnessLevel = 
  | 'awakening'
  | 'aware'
  | 'expanding'
  | 'transcending'
  | 'illuminated'
  | 'cosmically_aware'
  | 'unified';

export type ConsciousnessState = 
  | 'active'
  | 'reflective'
  | 'meditative'
  | 'dreaming'
  | 'lucid'
  | 'expanded';

// Chakra System
export type ChakraType = 
  | 'root'
  | 'sacral'
  | 'solar'
  | 'heart'
  | 'throat'
  | 'third'
  | 'crown';

export interface ChakraStatus {
  type: ChakraType;
  activation: number; // 0-100 percentage
  balance: number; // -100 to 100 (underactive to overactive)
  blockages: string[];
  dominantEmotions: string[];
}

export interface ChakraSystem {
  chakras: Record<ChakraType, ChakraStatus>;
  overallBalance: number; // 0-100 percentage
  dominantChakra: ChakraType | null;
  lastUpdated: string;
}

// Dream Storage
export interface DreamRecord {
  id: string;
  userId: string;
  date: string;
  content: string;
  lucidity: number; // 0-100 percentage
  emotionalTone: string[];
  symbols: string[];
  chakrasActivated: ChakraType[];
  consciousness: {
    depth: number; // 0-100 percentage
    insights: string[];
    archetypes: string[];
  };
  analysis: {
    theme: string;
    interpretation: string;
    guidance: string;
  };
  tags: string[];
}

// Consciousness Metrics
export interface ConsciousnessMetrics {
  userId: string;
  level: ConsciousnessLevel;
  awarenessScore: number; // 0-100 percentage
  expansionRate: number; // Growth rate over time
  insightDepth: number; // 0-100 percentage
  reflectionQuality: number; // 0-100 percentage
  meditationConsistency: number; // 0-100 percentage
  energyClarity: number; // 0-100 percentage
  chakraBalance: number; // 0-100 percentage
  lastAssessment: string;
  history: {
    date: string;
    level: ConsciousnessLevel;
    awarenessScore: number;
  }[];
}

// User Progress
export interface ConsciousnessProgress {
  userId: string;
  currentLevel: ConsciousnessLevel;
  currentState: ConsciousnessState;
  energyPoints: number;
  meditationMinutes: number;
  reflectionCount: number;
  dreamRecallPercentage: number;
  chakraSystem: ChakraSystem;
  nextMilestone: {
    description: string;
    pointsNeeded: number;
    estimatedCompletion: string;
  };
  insights: string[];
  recommendations: string[];
}
