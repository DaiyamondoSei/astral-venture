
/**
 * Emotion system types
 * Following the Type-Value Pattern
 */

// Emotion category
export type EmotionCategory = 
  | 'joy' 
  | 'sadness' 
  | 'anger' 
  | 'fear' 
  | 'surprise' 
  | 'disgust' 
  | 'anticipation'
  | 'trust'
  | 'other';

// Emotional depth level
export type EmotionalDepthLevel = 
  | 'surface' 
  | 'shallow' 
  | 'moderate' 
  | 'deep' 
  | 'profound';

// Import ChakraType directly to avoid circular dependencies
export { ChakraType } from '@/types/chakra/ChakraSystemTypes';

// Dream theme type
export type DreamTheme = 
  | 'water' 
  | 'fire' 
  | 'earth' 
  | 'air' 
  | 'light' 
  | 'darkness' 
  | 'transformation' 
  | 'journey' 
  | 'conflict'
  | 'unknown';

// Emotion intensity
export type EmotionIntensity = 'low' | 'medium' | 'high' | 'extreme';

// Analysis detail level
export type AnalysisDetailLevel = 'basic' | 'standard' | 'detailed' | 'comprehensive';

// Emotion data structure
export interface EmotionData {
  category: EmotionCategory;
  intensity: EmotionIntensity;
  description?: string;
  relatedChakras?: string[];
}

// Reflection analysis result
export interface ReflectionAnalysis {
  emotions: EmotionData[];
  themes: string[];
  depth: EmotionalDepthLevel;
  insights: string[];
  chakraActivations?: Record<string, number>;
}

// Chakra resonance data
export interface ChakraResonance {
  chakra: string;
  resonanceScore: number;
  keywords: string[];
  elements: string[];
}
