
/**
 * Centralized color utilities for energy visualizations
 * 
 * Provides a unified API for all color-related functionality
 */

// Re-export all functions from the main colorUtils module
export {
  generateEnergyColor,
  generateChakraGradient,
  generateCosmicGlow,
  chakraIndexToColor
} from '../colorUtils';

// Re-export chakra color utilities from the emotion module
export {
  getChakraColor,
  getChakraColors,
  getChakraIntensity,
  getChakraName,
  getChakraNames
} from '@/utils/emotion/chakraUtils';

// Export color conversion utilities
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Export color blending utilities
export const blendColors = (color1: string, color2: string, ratio: number = 0.5): string => {
  // Convert hex colors to RGB
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  
  // Blend the colors
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
