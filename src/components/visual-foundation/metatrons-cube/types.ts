
import { CubeSize, CubeTheme, GlowIntensity } from '@/types/core/performance/constants';

export interface MetatronsNode {
  id: string;
  x: number;
  y: number;
  activated?: boolean;
  importance?: number;
  label?: string;
  radius?: number;
  size?: number;
  tooltip?: string;
  pulsing?: boolean;
  active?: boolean;
}

export interface MetatronsConnection {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  strength?: number;
  activated?: boolean;
  
  // Additional properties needed
  from?: string;
  to?: string;
  active?: boolean;
  animated?: boolean;
  width?: number;
  intensity?: number;
}

export interface MetatronsCubeData {
  nodes: MetatronsNode[];
  connections: MetatronsConnection[];
  centerNodeId?: string;
}

export interface MetatronsCubeProps {
  size?: CubeSize;
  theme?: CubeTheme;
  data?: MetatronsCubeData;
  activatedNodes?: string[];
  glowIntensity?: GlowIntensity;
  interactive?: boolean;
  onNodeSelect?: (nodeId: string) => void;
  className?: string;
  animationLevel?: 'minimal' | 'standard' | 'enhanced';
  pulseEffect?: boolean;
  withAnimation?: boolean;
  nodes?: MetatronsNode[];
  connections?: MetatronsConnection[];
}

export interface CubeNodeProps {
  node: MetatronsNode;
  activated: boolean;
  onClick: () => void;
  glowIntensity?: GlowIntensity;
  theme?: CubeTheme;
  pulseEffect?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  isActive?: boolean;
  isSimplified?: boolean;
}

export interface CubeLinesProps {
  connections: MetatronsConnection[];
  nodes: Record<string, MetatronsNode>;
  activatedNodes: string[];
  theme?: CubeTheme;
  glowIntensity?: GlowIntensity;
  primaryColor?: string;
  secondaryColor?: string;
  activeNodeId?: string;
  isSimplified?: boolean;
}

export interface CubeRendererProps {
  data: MetatronsCubeData;
  activatedNodes: string[];
  theme?: CubeTheme;
  glowIntensity?: GlowIntensity;
  onNodeSelect?: (nodeId: string) => void;
  interactive?: boolean;
  pulseEffect?: boolean;
  
  // Additional properties needed
  nodes?: MetatronsNode[];
  connections?: MetatronsConnection[];
  activeNodeId?: string;
  onNodeClick?: (nodeId: string) => void;
  variant?: string;
  withAnimation?: boolean;
  intensity?: GlowIntensity;
}

// Export these enum types to make them accessible
export { CubeSize, CubeTheme, GlowIntensity };

// Define a CubeConnection type (for backward compatibility)
export type CubeConnection = MetatronsConnection;
