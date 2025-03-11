
/**
 * Types for Metatron's Cube Visualization
 */

// Node in Metatron's Cube
export interface MetatronsNode {
  id: string;
  x: number;
  y: number;
  size: number;
  active?: boolean;
  pulsing?: boolean;
  label?: string;
  tooltip?: string;
  energy?: number;
  state?: 'inactive' | 'active' | 'pulsing' | 'resonating';
  category?: string;
}

// Connection between nodes
export interface MetatronsConnection {
  from: string;
  to: string;
  active?: boolean;
  energy?: number;
  width?: number;
  type?: 'primary' | 'secondary' | 'energy' | 'resonance';
  animated?: boolean;
}

// Cube size options
export type CubeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Cube theme options
export type CubeTheme = 'default' | 'cosmic' | 'chakra' | 'energy' | 'spiritual' | 'quantum';

// Sacred geometry pattern types
export type GeometryPattern = 
  | 'metatronsCube' 
  | 'flowerOfLife' 
  | 'seedOfLife' 
  | 'treeOfLife' 
  | 'sri-yantra'
  | 'toroidal'
  | 'vesica-piscis'
  | 'golden-ratio';

// Energy field types
export type EnergyFieldType = 
  | 'resonance' 
  | 'vortex' 
  | 'torus' 
  | 'spiral' 
  | 'wave' 
  | 'quantum';

// Visual effect types  
export type EffectType =
  | 'glow'
  | 'particles'
  | 'rays'
  | 'shimmer'
  | 'ripple'
  | 'pulse';

// Animation quality configuration
export interface AnimationQuality {
  particleCount: number;
  glowIntensity: number;
  animationComplexity: number;
  geometryDetail: number;
  effectsEnabled: boolean;
}

// Resonance pattern configuration
export interface ResonancePattern {
  frequency: number;
  amplitude: number;
  phase: number;
  harmonics: number[];
}
