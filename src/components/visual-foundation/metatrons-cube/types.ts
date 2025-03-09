
export interface MetatronsCubeProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
  glowColor?: string;
  glowIntensity?: 'none' | 'low' | 'medium' | 'high';
  interactive?: boolean;
  spinSpeed?: number;
  nodeColor?: string;
  activeNodeColor?: string;
  onNodeClick?: (nodeId: number) => void;
  activeNodes?: number[];
  className?: string;
}

export interface CubeNode {
  id: number;
  x: number;
  y: number;
}

export interface CubeLine {
  from: number;
  to: number;
}
