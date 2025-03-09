
/**
 * Types for Metatron's Cube components
 */

// Supported sizes for the cube
export type CubeSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Supported theme variants
export type CubeTheme = 'default' | 'cosmic' | 'ethereal' | 'quantum';

// Glow intensity options
export type GlowIntensity = 'low' | 'medium' | 'high';

// A node in the cube
export interface MetatronsNode {
  id: string;
  x: number;
  y: number;
  size?: number;
  active?: boolean;
  pulsing?: boolean;
  label?: string;
  tooltip?: string;
}

// A connection between nodes
export interface CubeConnection {
  source: string;
  target: string;
  active?: boolean;
  pulsing?: boolean;
  color?: string;
}

// Props for the MetatronsCube component
export interface MetatronsCubeProps {
  className?: string;
  size?: CubeSize;
  variant?: CubeTheme;
  nodes: MetatronsNode[];
  connections: CubeConnection[];
  activeNodeId?: string;
  onNodeClick?: (nodeId: string) => void;
  withAnimation?: boolean;
  intensity?: number;
}

// Props for CubeRenderer component
export interface CubeRendererProps extends MetatronsCubeProps {}

// Props for CubeLines component
export interface CubeLinesProps {
  connections: CubeConnection[];
  nodes: Record<string, { x: number; y: number }>;
  primaryColor: string;
  secondaryColor: string;
  activeNodeId?: string;
  glowIntensity: GlowIntensity;
  isSimplified: boolean;
}

// Props for CubeNode component
export interface CubeNodeProps {
  node: MetatronsNode;
  primaryColor: string;
  secondaryColor: string;
  isActive?: boolean;
  onClick: (nodeId: string) => void;
  glowIntensity: GlowIntensity;
  isSimplified: boolean;
}
