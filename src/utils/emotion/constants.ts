
import { ChakraType, ChakraTypes } from '@/types/chakra/ChakraSystemTypes';

// Chakra color mapping
export const CHAKRA_COLORS: Record<ChakraType, string> = {
  [ChakraTypes.ROOT]: '#ff0000',      // Red
  [ChakraTypes.SACRAL]: '#ff7f00',    // Orange
  [ChakraTypes.SOLAR]: '#ffff00',     // Yellow
  [ChakraTypes.HEART]: '#00ff00',     // Green
  [ChakraTypes.THROAT]: '#00bfff',    // Light Blue
  [ChakraTypes.THIRD_EYE]: '#0000ff', // Indigo
  [ChakraTypes.CROWN]: '#8b00ff'      // Violet
};

// Chakra name mapping
export const CHAKRA_NAMES: Record<ChakraType, string> = {
  [ChakraTypes.ROOT]: 'Root',
  [ChakraTypes.SACRAL]: 'Sacral',
  [ChakraTypes.SOLAR]: 'Solar Plexus',
  [ChakraTypes.HEART]: 'Heart',
  [ChakraTypes.THROAT]: 'Throat',
  [ChakraTypes.THIRD_EYE]: 'Third Eye',
  [ChakraTypes.CROWN]: 'Crown'
};

// Color mapping with hex values
export const CHAKRA_COLOR_MAP = {
  root: '#ff0000',      // Red
  sacral: '#ff7f00',    // Orange
  solar: '#ffff00',     // Yellow
  heart: '#00ff00',     // Green
  throat: '#00bfff',    // Light Blue
  'third-eye': '#0000ff', // Indigo
  crown: '#8b00ff'      // Violet
};

// Emotion to chakra mapping
export const EMOTION_TO_CHAKRA_MAP: Record<string, ChakraType> = {
  // Root chakra emotions
  'fear': ChakraTypes.ROOT,
  'anxiety': ChakraTypes.ROOT,
  'insecurity': ChakraTypes.ROOT,
  
  // Sacral chakra emotions
  'passion': ChakraTypes.SACRAL,
  'pleasure': ChakraTypes.SACRAL,
  'desire': ChakraTypes.SACRAL,
  'creativity': ChakraTypes.SACRAL,
  
  // Solar plexus emotions
  'confidence': ChakraTypes.SOLAR,
  'power': ChakraTypes.SOLAR,
  'anger': ChakraTypes.SOLAR,
  'frustration': ChakraTypes.SOLAR,
  
  // Heart chakra emotions
  'love': ChakraTypes.HEART,
  'compassion': ChakraTypes.HEART,
  'grief': ChakraTypes.HEART,
  'sadness': ChakraTypes.HEART,
  
  // Throat chakra emotions
  'expression': ChakraTypes.THROAT,
  'truth': ChakraTypes.THROAT,
  'communication': ChakraTypes.THROAT,
  
  // Third eye emotions
  'intuition': ChakraTypes.THIRD_EYE,
  'insight': ChakraTypes.THIRD_EYE,
  'clarity': ChakraTypes.THIRD_EYE,
  'confusion': ChakraTypes.THIRD_EYE,
  
  // Crown chakra emotions
  'connection': ChakraTypes.CROWN,
  'enlightenment': ChakraTypes.CROWN,
  'awareness': ChakraTypes.CROWN,
  'wisdom': ChakraTypes.CROWN
};
