
/**
 * Types for the Metatron's Cube visualization components
 */
import { CubeSize, CubeTheme, GlowIntensity } from '@/types/core/performance/types';

// Node Types
export interface MetatronsNode {
  id: string;
  x: number;
  y: number;
  radius?: number;
  size?: number;
  label?: string;
  tooltip?: string;
  active?: boolean;
  pulsing?: boolean;
}

// Connection Types
export interface MetatronsConnection {
  id: string;
  source: string;
  target: string;
  // Compatibility aliases for backward compatibility
  from?: string;
  to?: string;
  active?: boolean;
  animated?: boolean;
  width?: number;
}

// Cube Data Structure
export interface MetatronsCubeData {
  nodes: Record<string, MetatronsNode>;
  connections: MetatronsConnection[];
}

// Main Component Props
export interface MetatronsCubeProps {
  nodes: MetatronsNode[];
  connections: MetatronsConnection[];
  variant?: CubeTheme;
  size?: CubeSize;
  className?: string;
  activeNodeId?: string;
  qualityLevel?: number;
  withAnimation?: boolean;
  intensity?: number;
  onNodeClick?: (nodeId: string) => void;
}

// Node Component Props
export interface CubeNodeProps {
  node: MetatronsNode;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
  activated: boolean;
  onClick: (nodeId: string) => void;
  glowIntensity: GlowIntensity;
  isSimplified: boolean;
}

// Lines Component Props
export interface CubeLinesProps {
  connections: MetatronsConnection[];
  nodes: Record<string, { x: number; y: number }>;
  primaryColor: string;
  secondaryColor: string;
  activeNodeId?: string;
  glowIntensity: GlowIntensity;
  isSimplified: boolean;
}

// Renderer Props
export interface CubeRendererProps {
  nodes: MetatronsNode[];
  connections: MetatronsConnection[];
  activeNodeId?: string;
  onNodeClick?: (nodeId: string) => void;
  variant?: CubeTheme;
  withAnimation?: boolean;
  intensity?: number;
}
