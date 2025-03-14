
import type { CubeSize, CubeTheme } from '@/utils/performance/core/constants';

/**
 * MetatronsNode represents a point in the Metatron's Cube geometry
 */
export interface MetatronsNode {
  id: string;
  x: number;
  y: number;
  radius?: number;
  energy?: number;
  active?: boolean;
  label?: string;
  type?: 'primary' | 'secondary' | 'intersection';
}

/**
 * MetatronsConnection represents a line connecting two nodes
 */
export interface MetatronsConnection {
  id: string;
  source: string;
  target: string;
  active?: boolean;
  energy?: number;
  from?: string; // Backward compatibility
  to?: string;   // Backward compatibility
  type?: 'primary' | 'secondary' | 'energy';
}

/**
 * GlowIntensity defines how strongly nodes and connections glow
 */
export type GlowIntensity = 'off' | 'low' | 'medium' | 'high';

/**
 * MetatronsCubeData represents the full geometric data structure
 */
export interface MetatronsCubeData {
  nodes: Record<string, MetatronsNode>;
  connections: MetatronsConnection[];
  centerNode?: string;
  primaryNodes?: string[];
  secondaryNodes?: string[];
}

/**
 * MetatronsCubeProps defines the props for the MetatronsCube component
 */
export interface MetatronsCubeProps {
  size?: CubeSize;
  theme?: CubeTheme;
  data?: MetatronsCubeData;
  nodes: Record<string, MetatronsNode>;
  activatedNodes?: string[];
  glowIntensity?: GlowIntensity;
  interactive?: boolean;
  simplified?: boolean;
  onNodeClick?: (nodeId: string) => void;
  energyFlowing?: boolean;
  rotationSpeed?: number;
  connections?: MetatronsConnection[];
}

/**
 * CubeNodeProps defines the props for a node in the Metatron's Cube
 */
export interface CubeNodeProps {
  node: MetatronsNode;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
  activated: boolean;
  onClick: () => void;
  glowIntensity: GlowIntensity | 'low' | 'medium' | 'high';
  isSimplified: boolean;
}

// Re-export types for consistency - using export type to avoid TS1205 error
export type { CubeSize, CubeTheme };
