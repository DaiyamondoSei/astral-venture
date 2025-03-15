
/**
 * Type definitions for the protected VisualSystem component
 * These types mirror the actual types used in the protected component
 * but are maintained separately to allow for adapter patterns
 */

import { MetatronsNode, MetatronsConnection } from '@/components/visual-foundation/metatrons-cube/types';
import { CubeTheme, CubeSize, GlowIntensity } from '@/components/visual-foundation/metatrons-cube/types';

// Visual System Connection Type
export interface VisualSystemConnection {
  id: string;
  // Primary properties
  source: string;
  target: string;
  // Compatibility properties for backward compatibility
  from?: string;
  to?: string;
  // Visual properties
  active?: boolean;
  animated?: boolean;
  width?: number;
  color?: string;
}

// Visual System Node Type
export interface VisualSystemNode {
  id: string;
  x: number;
  y: number;
  // Optional properties
  label?: string;
  radius?: number;
  size?: number;
  tooltip?: string;
  active?: boolean;
  pulsing?: boolean;
  color?: string;
}

// Visual System Props
export interface VisualSystemProps {
  nodes: VisualSystemNode[];
  connections: VisualSystemConnection[];
  variant?: CubeTheme;
  size?: CubeSize;
  activeNodeId?: string;
  qualityLevel?: number;
  withAnimation?: boolean;
  intensity?: number;
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

// Type guards and conversion utilities
export function isVisualSystemNode(node: unknown): node is VisualSystemNode {
  if (!node || typeof node !== 'object') return false;
  
  const typedNode = node as Partial<VisualSystemNode>;
  return (
    typeof typedNode.id === 'string' &&
    typeof typedNode.x === 'number' &&
    typeof typedNode.y === 'number'
  );
}

export function isVisualSystemConnection(conn: unknown): conn is VisualSystemConnection {
  if (!conn || typeof conn !== 'object') return false;
  
  const typedConn = conn as Partial<VisualSystemConnection>;
  return (
    typeof typedConn.id === 'string' &&
    typeof typedConn.source === 'string' &&
    typeof typedConn.target === 'string'
  );
}

// Conversion functions between MetatronsCube types and VisualSystem types
export function convertToVisualSystemNode(node: MetatronsNode): VisualSystemNode {
  return {
    id: node.id,
    x: node.x,
    y: node.y,
    radius: node.radius,
    size: node.size,
    label: node.label,
    tooltip: node.tooltip,
    active: node.active,
    pulsing: node.pulsing
  };
}

export function convertToVisualSystemConnection(conn: MetatronsConnection): VisualSystemConnection {
  return {
    id: conn.id,
    source: conn.source,
    target: conn.target,
    from: conn.from,
    to: conn.to,
    active: conn.active,
    animated: conn.animated,
    width: conn.width
  };
}

export function convertToMetatronsNode(node: VisualSystemNode): MetatronsNode {
  return {
    id: node.id,
    x: node.x,
    y: node.y,
    radius: node.radius,
    size: node.size,
    label: node.label,
    tooltip: node.tooltip,
    active: node.active,
    pulsing: node.pulsing
  };
}

export function convertToMetatronsConnection(conn: VisualSystemConnection): MetatronsConnection {
  return {
    id: conn.id,
    source: conn.source,
    target: conn.target,
    from: conn.from || conn.source,
    to: conn.to || conn.target,
    active: conn.active,
    animated: conn.animated,
    width: conn.width
  };
}
