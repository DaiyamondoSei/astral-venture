
/**
 * Types for emotional analysis
 */

export interface EmotionAnalysisResult {
  chakras: number[];
  emotions: string[];
  insights: string[];
}

export interface EmotionalDepthResult {
  score: number;
  category: string;
  feedback: string;
}

export interface ChakraAnalysisResult {
  activatedChakras: number[];
  chakraBalance: number;
  chakraNames: string[];
  chakraColors: string[];
}

export interface EmotionalGrowthMetrics {
  reflectionCount: number;
  emotionalDepth: number;
  activatedChakras: number[];
  dominantEmotions: string[];
  streakDays: number;
}
