
/**
 * Emotion system constants
 * Following the Type-Value Pattern
 */
import { EmotionCategory, EmotionalDepthLevel, DreamTheme, EmotionIntensity, AnalysisDetailLevel } from './types';
import { ChakraType } from '@/types/chakra/ChakraSystemTypes';

// Runtime values for EmotionCategory
export const EmotionCategories = {
  JOY: 'joy' as EmotionCategory,
  SADNESS: 'sadness' as EmotionCategory,
  ANGER: 'anger' as EmotionCategory,
  FEAR: 'fear' as EmotionCategory,
  SURPRISE: 'surprise' as EmotionCategory,
  DISGUST: 'disgust' as EmotionCategory,
  ANTICIPATION: 'anticipation' as EmotionCategory,
  TRUST: 'trust' as EmotionCategory,
  OTHER: 'other' as EmotionCategory
} as const;

// Runtime values for EmotionalDepthLevel
export const EmotionalDepthLevels = {
  SURFACE: 'surface' as EmotionalDepthLevel,
  SHALLOW: 'shallow' as EmotionalDepthLevel,
  MODERATE: 'moderate' as EmotionalDepthLevel,
  DEEP: 'deep' as EmotionalDepthLevel,
  PROFOUND: 'profound' as EmotionalDepthLevel
} as const;

// Runtime values for DreamTheme
export const DreamThemes = {
  WATER: 'water' as DreamTheme,
  FIRE: 'fire' as DreamTheme,
  EARTH: 'earth' as DreamTheme,
  AIR: 'air' as DreamTheme,
  LIGHT: 'light' as DreamTheme,
  DARKNESS: 'darkness' as DreamTheme,
  TRANSFORMATION: 'transformation' as DreamTheme,
  JOURNEY: 'journey' as DreamTheme,
  CONFLICT: 'conflict' as DreamTheme,
  UNKNOWN: 'unknown' as DreamTheme
} as const;

// Runtime values for EmotionIntensity
export const EmotionIntensities = {
  LOW: 'low' as EmotionIntensity,
  MEDIUM: 'medium' as EmotionIntensity,
  HIGH: 'high' as EmotionIntensity,
  EXTREME: 'extreme' as EmotionIntensity
} as const;

// Runtime values for AnalysisDetailLevel
export const AnalysisDetailLevels = {
  BASIC: 'basic' as AnalysisDetailLevel,
  STANDARD: 'standard' as AnalysisDetailLevel,
  DETAILED: 'detailed' as AnalysisDetailLevel,
  COMPREHENSIVE: 'comprehensive' as AnalysisDetailLevel
} as const;

// Chakra colors for visualization
export const CHAKRA_COLORS = [
  "#FF0000", // Root - Red
  "#FF8000", // Sacral - Orange
  "#FFFF00", // Solar Plexus - Yellow
  "#00FF00", // Heart - Green
  "#00FFFF", // Throat - Light Blue
  "#0000FF", // Third Eye - Indigo
  "#8000FF"  // Crown - Violet
];

// Chakra names for display
export const CHAKRA_NAMES = [
  "Root",
  "Sacral",
  "Solar Plexus",
  "Heart",
  "Throat",
  "Third Eye",
  "Crown"
];

// Import ChakraTypes from ChakraSystemTypes
import { ChakraTypes } from '@/types/chakra/constants';
export { ChakraTypes };

// Chakra color mappings
export const CHAKRA_COLOR_MAP: Record<ChakraType, string> = {
  'root': CHAKRA_COLORS[0],
  'sacral': CHAKRA_COLORS[1],
  'solar': CHAKRA_COLORS[2],
  'heart': CHAKRA_COLORS[3],
  'throat': CHAKRA_COLORS[4],
  'third-eye': CHAKRA_COLORS[5],
  'crown': CHAKRA_COLORS[6]
};

// Chakra name mappings
export const CHAKRA_NAME_MAP: Record<ChakraType, string> = {
  'root': CHAKRA_NAMES[0],
  'sacral': CHAKRA_NAMES[1],
  'solar': CHAKRA_NAMES[2],
  'heart': CHAKRA_NAMES[3],
  'throat': CHAKRA_NAMES[4],
  'third-eye': CHAKRA_NAMES[5],
  'crown': CHAKRA_NAMES[6]
};

// Element associations for chakras
export const CHAKRA_ELEMENTS = {
  'root': 'earth',
  'sacral': 'water',
  'solar': 'fire',
  'heart': 'air',
  'throat': 'sound',
  'third-eye': 'light',
  'crown': 'consciousness'
};
