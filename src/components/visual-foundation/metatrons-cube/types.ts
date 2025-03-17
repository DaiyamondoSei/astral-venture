
/**
 * Metatron's Cube Types
 * 
 * This module provides types for the Metatron's Cube visualization component.
 */

import { ChakraType } from '@/types/chakra/ChakraSystemTypes';

// Size options for the cube
export type CubeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Theme options
export type CubeTheme = 'default' | 'cosmic' | 'ethereal' | 'chakra' | 'energy' | 'spiritual' | 'quantum';

// Glow intensity levels
export type GlowIntensity = 'none' | 'low' | 'medium' | 'high';

// Node data structure
export interface MetatronsNode {
  id: string;
  x: number;
  y: number;
  radius?: number;
  label?: string;
  chakraType?: ChakraType;
  energyLevel?: number;
  active?: boolean;
  highlighted?: boolean;
  pulsating?: boolean;
  color?: string;
  secondaryColor?: string;
  glowColor?: string;
  glowIntensity?: GlowIntensity;
  tooltip?: string;
  data?: Record<string, unknown>;
}

// Connection between nodes
export interface MetatronsConnection {
  id: string;
  source: string;
  target: string;
  from?: string; // Alias for source (for compatibility)
  to?: string;   // Alias for target (for compatibility)
  strength?: number;
  active?: boolean;
  color?: string;
  width?: number;
  animated?: boolean;
  dashed?: boolean;
  bidirectional?: boolean;
  label?: string;
  data?: Record<string, unknown>;
}

// Props for the cube component
export interface MetatronsCubeProps {
  size?: CubeSize;
  theme?: CubeTheme;
  nodes?: MetatronsNode[];
  connections?: MetatronsConnection[];
  interactive?: boolean;
  animationEnabled?: boolean;
  glowIntensity?: GlowIntensity;
  simplified?: boolean;
  selectedNodeId?: string;
  chakraActivations?: Record<ChakraType, number>;
  onNodeClick?: (nodeId: string) => void;
  onConnectionClick?: (connectionId: string) => void;
  className?: string;
}

// Props for individual node components
export interface CubeNodeProps {
  node: MetatronsNode;
  activated: boolean;
  isActive: boolean;
  onClick: () => void;
  primaryColor: string;
  secondaryColor: string;
  glowIntensity: GlowIntensity;
  isSimplified: boolean;
}

// Props for connection components
export interface CubeConnectionProps {
  connection: MetatronsConnection;
  isActive: boolean;
  onClick?: () => void;
  glowIntensity: GlowIntensity;
  isSimplified: boolean;
}

// Configuration for the layout engine
export interface CubeLayoutConfig {
  radius: number;
  spacing: number;
  centerX: number;
  centerY: number;
  nodeRadius: number;
  useForce?: boolean;
  forceStrength?: number;
}

// Export these types to be available for other components
export const CubeSizeValues = ['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const;
export const CubeThemeValues = ['default', 'cosmic', 'ethereal', 'chakra', 'energy', 'spiritual', 'quantum'] as const;
export const GlowIntensityValues = ['none', 'low', 'medium', 'high'] as const;
