
/**
 * Chakra System Constants
 * 
 * This module provides runtime constants for the chakra energy system.
 */

import { ChakraType } from './ChakraSystemTypes';

/**
 * Chakra types as runtime constants
 */
export const ChakraTypes = {
  ROOT: 'root' as ChakraType,
  SACRAL: 'sacral' as ChakraType,
  SOLAR: 'solar' as ChakraType,
  HEART: 'heart' as ChakraType,
  THROAT: 'throat' as ChakraType,
  THIRD_EYE: 'third-eye' as ChakraType,
  CROWN: 'crown' as ChakraType
};

/**
 * Default chakra colors
 */
export const CHAKRA_COLORS: Record<ChakraType, string> = {
  'root': '#FF0000',      // Red
  'sacral': '#FF7F00',    // Orange
  'solar': '#FFFF00',     // Yellow
  'heart': '#00FF00',     // Green
  'throat': '#0000FF',    // Blue
  'third-eye': '#4B0082', // Indigo
  'crown': '#9400D3'      // Violet
};

/**
 * Chakra names for display
 */
export const CHAKRA_NAMES: Record<ChakraType, string> = {
  'root': 'Root Chakra',
  'sacral': 'Sacral Chakra',
  'solar': 'Solar Plexus Chakra',
  'heart': 'Heart Chakra',
  'throat': 'Throat Chakra',
  'third-eye': 'Third Eye Chakra',
  'crown': 'Crown Chakra'
};

/**
 * Chakra positions in vertical order (bottom to top)
 */
export const CHAKRA_POSITIONS: ChakraType[] = [
  'root',
  'sacral',
  'solar',
  'heart',
  'throat',
  'third-eye',
  'crown'
];

/**
 * Chakra element associations
 */
export const CHAKRA_ELEMENTS: Record<ChakraType, string> = {
  'root': 'Earth',
  'sacral': 'Water',
  'solar': 'Fire',
  'heart': 'Air',
  'throat': 'Ether',
  'third-eye': 'Light',
  'crown': 'Cosmic Energy'
};

/**
 * Default chakra status for a new system
 */
export const DEFAULT_CHAKRA_STATUS = {
  active: false,
  level: 1,
  energy: 0,
  blocked: false
};

/**
 * Creates a default chakra system
 */
export function createDefaultChakraSystem() {
  return {
    chakras: {
      'root': { ...DEFAULT_CHAKRA_STATUS },
      'sacral': { ...DEFAULT_CHAKRA_STATUS },
      'solar': { ...DEFAULT_CHAKRA_STATUS },
      'heart': { ...DEFAULT_CHAKRA_STATUS },
      'throat': { ...DEFAULT_CHAKRA_STATUS },
      'third-eye': { ...DEFAULT_CHAKRA_STATUS },
      'crown': { ...DEFAULT_CHAKRA_STATUS }
    },
    activationStates: {
      'root': false,
      'sacral': false,
      'solar': false,
      'heart': false,
      'throat': false,
      'third-eye': false,
      'crown': false
    },
    energyLevels: {
      'root': 0,
      'sacral': 0,
      'solar': 0,
      'heart': 0,
      'throat': 0,
      'third-eye': 0,
      'crown': 0
    },
    balanceMetrics: {
      overallBalance: 0,
      chakraBalanceRatios: {
        'root': 0,
        'sacral': 0,
        'solar': 0,
        'heart': 0,
        'throat': 0,
        'third-eye': 0,
        'crown': 0
      }
    }
  };
}
