
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
