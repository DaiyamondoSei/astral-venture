
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
  chakras: number[];          // Indices of activated chakras
  intensity: number[];        // Intensity values for each chakra (0-1)
  dominantChakra: number;     // Index of the most strongly activated chakra
  balanceScore: number;       // Overall chakra balance score (0-1)
  recommendations: string[];  // Practice recommendations based on analysis
  dominantThemes: string[];   // Dominant emotional themes detected
  emotions?: string[];        // For compatibility with existing code
  insights?: string[];        // For compatibility with existing code
}

export interface EmotionalGrowthMetrics {
  reflectionCount: number;
  emotionalDepth: number;
  activatedChakras: number[];
  dominantEmotions: string[];
  streakDays: number;
}
