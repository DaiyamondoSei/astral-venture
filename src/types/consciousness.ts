
// Core consciousness data types

export type ConsciousnessLevel = 
  | 'awakening'
  | 'aware'
  | 'expanding'
  | 'transcending'
  | 'illuminated'
  | 'cosmically_aware'
  | 'unified';

export type ChakraType = 
  | 'root'
  | 'sacral'
  | 'solar'
  | 'heart'
  | 'throat'
  | 'third'
  | 'crown';

export interface ConsciousnessMetrics {
  userId: string;
  level: ConsciousnessLevel;
  awarenessScore: number;
  expansionRate: number;
  insightDepth: number;
  reflectionQuality: number;
  meditationConsistency: number;
  energyClarity: number;
  chakraBalance: number;
  lastAssessment: string;
  history: ConsciousnessHistoryEntry[];
}

export interface ConsciousnessHistoryEntry {
  date: string;
  awarenessScore: number;
  level: ConsciousnessLevel;
}

export interface ChakraStatus {
  type: ChakraType;
  activation: number;
  balance: number;
  blockages: string[];
  dominantEmotions: string[];
}

export interface ChakraSystem {
  chakras: Record<ChakraType, ChakraStatus>;
  overallBalance: number;
  dominantChakra: ChakraType | null;
  lastUpdated: string;
}

export interface DreamConsciousness {
  depth: number;
  insights: string[];
  archetypes: string[];
}

export interface DreamAnalysis {
  theme: string;
  interpretation: string;
  guidance: string;
}

export interface DreamRecord {
  id: string;
  userId: string;
  date: string;
  content: string;
  lucidity: number;
  emotionalTone: string[];
  symbols: string[];
  chakrasActivated: ChakraType[];
  consciousness?: DreamConsciousness;
  analysis?: DreamAnalysis;
  tags: string[];
}

export interface ConsciousnessInsight {
  id: string;
  text: string;
  source: 'meditation' | 'dream' | 'reflection' | 'chakra' | 'system';
  relevance: number;
  dateGenerated: string;
}

export interface ConsciousnessRecommendation {
  id: string;
  type: 'practice' | 'reflection' | 'meditation' | 'chakra';
  title: string;
  description: string;
  priorityLevel: number;
}

export interface ConsciousnessProgress {
  userId: string;
  currentLevel: ConsciousnessLevel;
  currentState: 'inactive' | 'active' | 'balanced' | 'expanding' | 'evolving';
  energyPoints: number;
  meditationMinutes: number;
  reflectionCount: number;
  dreamRecallPercentage: number;
  chakraSystem: {
    chakras: Record<string, any>;
    overallBalance: number;
    dominantChakra: ChakraType | null;
    lastUpdated: string;
  };
  nextMilestone: {
    description: string;
    pointsNeeded: number;
    estimatedCompletion: string;
  };
  insights: ConsciousnessInsight[];
  recommendations: ConsciousnessRecommendation[];
}
