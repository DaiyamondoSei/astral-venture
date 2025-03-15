
/**
 * Runtime constants for the protected VisualSystem component
 * 
 * This file follows the Type-Value pattern to provide runtime constants
 * that correspond to the types defined in the visual system
 */

import { CubeTheme, CubeSize, GlowIntensity } from '@/components/visual-foundation/metatrons-cube/types';

// Cube Theme values
export const CubeThemes = {
  DEFAULT: 'default' as CubeTheme,
  COSMIC: 'cosmic' as CubeTheme,
  ETHEREAL: 'ethereal' as CubeTheme,
  CHAKRA: 'chakra' as CubeTheme,
  ENERGY: 'energy' as CubeTheme,
  SPIRITUAL: 'spiritual' as CubeTheme,
  QUANTUM: 'quantum' as CubeTheme
} as const;

// Cube Size values
export const CubeSizes = {
  XS: 'xs' as CubeSize,
  SM: 'sm' as CubeSize,
  MD: 'md' as CubeSize,
  LG: 'lg' as CubeSize,
  XL: 'xl' as CubeSize,
  FULL: 'full' as CubeSize
} as const;

// Glow Intensity values
export const GlowIntensities = {
  NONE: 'none' as GlowIntensity,
  LOW: 'low' as GlowIntensity,
  MEDIUM: 'medium' as GlowIntensity,
  HIGH: 'high' as GlowIntensity
} as const;

// Default visual system configuration
export const DEFAULT_VISUAL_SYSTEM_CONFIG = {
  theme: CubeThemes.DEFAULT,
  size: CubeSizes.MD,
  glowIntensity: GlowIntensities.MEDIUM,
  withAnimation: true,
  qualityLevel: 2
};

// Theme color mappings
export const THEME_COLOR_MAP: Record<CubeTheme, { primary: string; secondary: string }> = {
  default: { primary: '#4F46E5', secondary: '#818CF8' },
  cosmic: { primary: '#8B5CF6', secondary: '#A78BFA' },
  ethereal: { primary: '#10B981', secondary: '#34D399' },
  chakra: { primary: '#F59E0B', secondary: '#FBBF24' },
  energy: { primary: '#EF4444', secondary: '#F87171' },
  spiritual: { primary: '#8B5CF6', secondary: '#A78BFA' },
  quantum: { primary: '#06B6D4', secondary: '#22D3EE' }
};
