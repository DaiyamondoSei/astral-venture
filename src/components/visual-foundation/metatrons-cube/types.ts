
import React from 'react';

export type CubeTheme = 'default' | 'cosmic' | 'ethereal' | 'quantum';
export type CubeSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type GlowIntensity = 'none' | 'low' | 'medium' | 'high';

export interface MetatronsNode {
  id: string;
  x: number;
  y: number;
  radius?: number;
  active?: boolean;
  label?: string;
  type?: 'default' | 'chakra' | 'achievement' | 'portal';
  size?: number;
  tooltip?: string;
  pulsing?: boolean;
}

export interface MetatronsConnection {
  from: string;
  to: string;
  source?: string; // Adding for backward compatibility
  target?: string; // Adding for backward compatibility
  animated?: boolean;
  active?: boolean;
  intensity?: number;
}

export interface MetatronsCubeProps {
  className?: string;
  size?: CubeSize;
  variant?: CubeTheme;
  nodes?: MetatronsNode[];
  connections?: MetatronsConnection[];
  activeNodeId?: string;
  onNodeClick?: (nodeId: string) => void;
  withAnimation?: boolean;
  intensity?: number;
  children?: React.ReactNode;
}

export interface CubeRendererProps {
  nodes: MetatronsNode[];
  connections: MetatronsConnection[];
  activeNodeId?: string;
  onNodeClick?: (nodeId: string) => void;
  variant?: CubeTheme;
  size?: CubeSize;
  withAnimation?: boolean;
  intensity?: number;
}

export interface CubeNodeProps {
  node: MetatronsNode;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
  onClick: (nodeId: string) => void;
  glowIntensity: GlowIntensity;
  isSimplified: boolean;
}

export interface CubeLinesProps {
  connections: MetatronsConnection[];
  nodes: Record<string, { x: number; y: number }>;
  primaryColor: string;
  secondaryColor: string;
  activeNodeId?: string;
  glowIntensity: GlowIntensity;
  isSimplified: boolean;
}

// For backward compatibility
export type CubeNode = MetatronsNode;
export type CubeLine = MetatronsConnection;
export type CubeConnection = MetatronsConnection;
