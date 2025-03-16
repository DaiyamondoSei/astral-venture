
/**
 * Chakra system constants
 * Following the Type-Value Pattern
 */
import { ChakraType } from './ChakraSystemTypes';

// Runtime values for ChakraType
export const ChakraTypes = {
  ROOT: 'root' as ChakraType,
  SACRAL: 'sacral' as ChakraType,
  SOLAR: 'solar' as ChakraType,
  HEART: 'heart' as ChakraType,
  THROAT: 'throat' as ChakraType,
  THIRD_EYE: 'third-eye' as ChakraType,
  CROWN: 'crown' as ChakraType
} as const;

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

// Chakra mappings for visualization
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
