
export type CubeTheme = 'default' | 'cosmic' | 'ethereal' | 'quantum';
export type CubeSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type GlowIntensity = 'low' | 'medium' | 'high';

export interface MetatronsNode {
  id: string;
  x: number;
  y: number;
  [key: string]: any;
}

export interface MetatronsConnection {
  id: string;
  from: string;
  to: string;
  [key: string]: any;
}

export interface MetatronsCubeProps {
  className?: string;
  size?: CubeSize;
  variant?: CubeTheme;
  nodes: MetatronsNode[];
  connections: MetatronsConnection[];
  activeNodeId?: string;
  onNodeClick?: (nodeId: string) => void;
  withAnimation?: boolean;
  intensity?: number;
}

// Add CubeNode and CubeLine types for cubeUtils.ts
export interface CubeNode {
  id: string;
  x: number;
  y: number;
  radius?: number;
  status?: string;
  isActive?: boolean;
  label?: string;
}

export interface CubeLine {
  id: string;
  from: string;
  to: string;
  status?: string;
  isActive?: boolean;
}
