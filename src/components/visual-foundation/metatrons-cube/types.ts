
import { CubeSize, CubeTheme, GlowIntensity } from '@/types/core/performance/constants';

export interface MetatronsNode {
  id: string;
  x: number;
  y: number;
  activated?: boolean;
  importance?: number;
  label?: string;
  radius?: number;  // Add radius property which was missing
}

export interface MetatronsConnection {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  strength?: number;
  activated?: boolean;
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
}

export interface CubeNodeProps {
  node: MetatronsNode;
  activated: boolean;
  onClick: () => void;
  glowIntensity?: GlowIntensity;
  theme?: CubeTheme;
  pulseEffect?: boolean;
}

export interface CubeLinesProps {
  connections: MetatronsConnection[];
  nodes: Record<string, MetatronsNode>;
  activatedNodes: string[];
  theme?: CubeTheme;
  glowIntensity?: GlowIntensity;
}

export interface CubeRendererProps {
  data: MetatronsCubeData;
  activatedNodes: string[];
  theme?: CubeTheme;
  glowIntensity?: GlowIntensity;
  onNodeSelect?: (nodeId: string) => void;
  interactive?: boolean;
  pulseEffect?: boolean;
}
