
/**
 * Constants for emotion-related functionality
 * 
 * Following the Type-Value Pattern to provide both compile-time
 * type checking and runtime constant values.
 */

import { 
  EmotionCategory, 
  EmotionalDepthLevel, 
  ChakraType 
} from './types';

// Emotion categories constants
export const EmotionCategories = {
  POSITIVE: 'positive' as EmotionCategory,
  NEGATIVE: 'negative' as EmotionCategory,
  NEUTRAL: 'neutral' as EmotionCategory,
  COMPLEX: 'complex' as EmotionCategory
};

// Emotional depth level constants
export const EmotionalDepthLevels = {
  SURFACE: 'surface' as EmotionalDepthLevel,
  INTERMEDIATE: 'intermediate' as EmotionalDepthLevel,
  DEEP: 'deep' as EmotionalDepthLevel,
  PROFOUND: 'profound' as EmotionalDepthLevel
};

// Chakra types constants
export const ChakraTypes = {
  ROOT: 'root' as ChakraType,
  SACRAL: 'sacral' as ChakraType,
  SOLAR: 'solar' as ChakraType,
  HEART: 'heart' as ChakraType,
  THROAT: 'throat' as ChakraType,
  THIRD_EYE: 'third-eye' as ChakraType,
  CROWN: 'crown' as ChakraType
};

// Chakra colors (maintaining consistent order with ChakraTypes)
export const CHAKRA_COLORS = [
  "#FF0000", // Root - Red
  "#FF8000", // Sacral - Orange
  "#FFFF00", // Solar Plexus - Yellow
  "#00FF00", // Heart - Green
  "#00FFFF", // Throat - Light Blue
  "#0000FF", // Third Eye - Indigo
  "#8000FF"  // Crown - Violet
];

// Chakra names (maintaining consistent order with ChakraTypes)
export const CHAKRA_NAMES = [
  "Root",
  "Sacral",
  "Solar Plexus",
  "Heart",
  "Throat",
  "Third Eye",
  "Crown"
];

// Analysis threshold constants
export const ANALYSIS_THRESHOLDS = {
  MINIMUM_CONTENT_LENGTH: 20,
  DEPTH_THRESHOLD_INTERMEDIATE: 0.3,
  DEPTH_THRESHOLD_DEEP: 0.6,
  DEPTH_THRESHOLD_PROFOUND: 0.85,
  GROWTH_THRESHOLD_SIGNIFICANT: 0.15,
  INSIGHT_CONFIDENCE_THRESHOLD: 0.7
};
