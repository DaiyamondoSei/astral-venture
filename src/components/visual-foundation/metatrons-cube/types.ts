
import React from 'react';

/**
 * Supported cube theme variants
 */
export type CubeTheme = 'default' | 'cosmic' | 'ethereal' | 'quantum';

/**
 * Supported cube size options
 */
export type CubeSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Glow intensity levels for visual effects
 */
export type GlowIntensity = 'none' | 'low' | 'medium' | 'high';

/**
 * Node type within Metatron's cube
 */
export type NodeType = 'default' | 'chakra' | 'achievement' | 'portal';

/**
 * Node within the Metatron's cube visualization
 */
export interface MetatronsNode {
  /** Unique identifier for the node */
  id: string;
  /** X-coordinate position (0-100) */
  x: number;
  /** Y-coordinate position (0-100) */
  y: number;
  /** Optional radius of the node */
  radius?: number;
  /** Whether the node is in active state */
  active?: boolean;
  /** Optional label text for the node */
  label?: string;
  /** Node display type affecting visual appearance */
  type?: NodeType;
  /** Optional size override for the node */
  size?: number;
  /** Tooltip text to display on hover */
  tooltip?: string;
  /** Whether the node should have a pulsing animation */
  pulsing?: boolean;
}

/**
 * Connection between nodes in Metatron's cube
 */
export interface MetatronsConnection {
  /** ID of the source/origin node */
  from: string;
  /** ID of the target/destination node */
  to: string;
  /** 
   * @deprecated Use 'from' instead 
   * Legacy field for backward compatibility
   */
  source?: string;
  /** 
   * @deprecated Use 'to' instead
   * Legacy field for backward compatibility 
   */
  target?: string;
  /** Whether the connection should be animated */
  animated?: boolean;
  /** Whether the connection is in active state */
  active?: boolean;
  /** Visual intensity of the connection (0-1) */
  intensity?: number;
}

/**
 * Main props for the MetatronsCube component
 */
export interface MetatronsCubeProps {
  /** Optional CSS class name */
  className?: string;
  /** Size of the cube visualization */
  size?: CubeSize;
  /** Visual theme variant */
  variant?: CubeTheme;
  /** Nodes to display in the visualization */
  nodes?: MetatronsNode[];
  /** Connections between nodes */
  connections?: MetatronsConnection[];
  /** Currently active node ID */
  activeNodeId?: string;
  /** Handler for node click events */
  onNodeClick?: (nodeId: string) => void;
  /** Whether to enable animations */
  withAnimation?: boolean;
  /** Overall intensity of visual effects (0-1) */
  intensity?: number;
  /** Child elements to render within the cube */
  children?: React.ReactNode;
}

/**
 * Props for the internal CubeRenderer component
 */
export interface CubeRendererProps {
  /** Nodes to render */
  nodes: MetatronsNode[];
  /** Connections between nodes */
  connections: MetatronsConnection[];
  /** Currently active node ID */
  activeNodeId?: string;
  /** Handler for node click events */
  onNodeClick?: (nodeId: string) => void;
  /** Visual theme variant */
  variant?: CubeTheme;
  /** Size of the visualization */
  size?: CubeSize;
  /** Whether to enable animations */
  withAnimation?: boolean;
  /** Overall intensity of visual effects (0-1) */
  intensity?: number;
}

/**
 * Props for individual node components
 */
export interface CubeNodeProps {
  /** Node data to render */
  node: MetatronsNode;
  /** Primary color for the node */
  primaryColor: string;
  /** Secondary color for the node */
  secondaryColor: string;
  /** Whether this node is currently active */
  isActive: boolean;
  /** Handler for click events */
  onClick: (nodeId: string) => void;
  /** Visual glow intensity */
  glowIntensity: GlowIntensity;
  /** Whether to use simplified rendering for performance */
  isSimplified: boolean;
}

/**
 * Props for the lines connecting nodes
 */
export interface CubeLinesProps {
  /** Connections to render */
  connections: MetatronsConnection[];
  /** Map of node IDs to positions */
  nodes: Record<string, { x: number; y: number }>;
  /** Primary color for the lines */
  primaryColor: string;
  /** Secondary color for the lines */
  secondaryColor: string;
  /** Currently active node ID */
  activeNodeId?: string;
  /** Visual glow intensity */
  glowIntensity: GlowIntensity;
  /** Whether to use simplified rendering for performance */
  isSimplified: boolean;
}

/**
 * Normalized connection type with standardized properties
 * Used internally after processing legacy properties
 */
export interface NormalizedConnection {
  /** ID of the source/origin node */
  from: string;
  /** ID of the target/destination node */
  to: string;
  /** Whether the connection should be animated */
  animated: boolean;
  /** Whether the connection is in active state */
  active: boolean;
  /** Visual intensity of the connection (0-1) */
  intensity: number;
}

// Legacy type aliases for backward compatibility
/**
 * @deprecated Use MetatronsNode instead
 */
export type CubeNode = MetatronsNode;

/**
 * @deprecated Use MetatronsConnection instead
 */
export type CubeLine = MetatronsConnection;

/**
 * @deprecated Use MetatronsConnection instead
 */
export type CubeConnection = MetatronsConnection;
