
/**
 * Types for emotional analysis
 */

export interface EmotionalFactors {
  emotionalDepth: number;
  selfAwareness: number;
  chakraResonance: number;
  emotionalThemes: string[];
}

export interface EmotionAnalysisResult {
  chakras: number[];
  emotions: string[];
  insights: string[];
}

export interface EmotionalInsight {
  content: string;
  type: 'personal' | 'chakra' | 'emotional' | 'growth' | 'practice';
  intensity: number; // 0-1 scale
}

export interface EmotionalProfile {
  dominant: string[];
  emerging: string[];
  challenged: string[];
  growth: number; // 0-100 scale
  chakraBalance: number; // 0-1 scale
  reflectionDepth: number; // 0-1 scale
  insights: EmotionalInsight[];
}

export interface ChakraActivationStatus {
  index: number;
  name: string;
  active: boolean;
  intensity: number; // 0-1 scale
  associatedEmotions: string[];
}

export interface ReflectionMetrics {
  wordCount: number;
  emotionalDepth: number;
  reflectionFrequency: number; // days per week
  topicDiversity: number; // 0-1 scale
  growthTrend: 'increasing' | 'stable' | 'decreasing' | 'fluctuating';
}
