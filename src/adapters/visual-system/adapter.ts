
/**
 * Adapter functions for the protected VisualSystem component
 * 
 * These functions allow other components to safely interact with
 * the protected VisualSystem component without direct modifications
 */

import { 
  VisualSystemProps, 
  VisualSystemNode, 
  VisualSystemConnection,
  convertToVisualSystemNode,
  convertToVisualSystemConnection,
  convertToMetatronsNode,
  convertToMetatronsConnection
} from './types';
import { CubeThemes, CubeSizes, GlowIntensities, DEFAULT_VISUAL_SYSTEM_CONFIG } from './constants';
import { 
  MetatronsNode, 
  MetatronsConnection,
  MetatronsCubeProps
} from '@/components/visual-foundation/metatrons-cube/types';
import { normalizeConnections, normalizeNodes } from '@/utils/connectionNormalizer';

/**
 * Creates a properly formatted props object for the VisualSystem component
 */
export function createVisualSystemProps(props: Partial<VisualSystemProps> = {}): VisualSystemProps {
  return {
    nodes: props.nodes || [],
    connections: props.connections || [],
    variant: props.variant || DEFAULT_VISUAL_SYSTEM_CONFIG.theme,
    size: props.size || DEFAULT_VISUAL_SYSTEM_CONFIG.size,
    qualityLevel: props.qualityLevel || DEFAULT_VISUAL_SYSTEM_CONFIG.qualityLevel,
    withAnimation: props.withAnimation ?? DEFAULT_VISUAL_SYSTEM_CONFIG.withAnimation,
    intensity: props.intensity || 1,
    activeNodeId: props.activeNodeId,
    onNodeClick: props.onNodeClick,
    className: props.className
  };
}

/**
 * Normalizes a collection of nodes to ensure they have all required properties
 */
export function normalizeVisualSystemNodes(nodes: Partial<VisualSystemNode>[]): VisualSystemNode[] {
  return nodes.map((node, index) => ({
    id: node.id || `node-${index}`,
    x: node.x || 0,
    y: node.y || 0,
    radius: node.radius || 5,
    size: node.size || 5,
    label: node.label || '',
    tooltip: node.tooltip || node.label || '',
    active: node.active || false,
    pulsing: node.pulsing || false,
    color: node.color
  }));
}

/**
 * Normalizes a collection of connections to ensure they have all required properties
 */
export function normalizeVisualSystemConnections(
  connections: Partial<VisualSystemConnection>[]
): VisualSystemConnection[] {
  return connections.map((connection, index) => ({
    id: connection.id || `connection-${index}`,
    source: connection.source || connection.from || '',
    target: connection.target || connection.to || '',
    from: connection.from || connection.source || '',
    to: connection.to || connection.target || '',
    active: connection.active || false,
    animated: connection.animated || false,
    width: connection.width || 1,
    color: connection.color
  }));
}

/**
 * Converts MetatronsCube props to VisualSystem props
 */
export function convertMetatronsCubePropsToVisualSystemProps(
  props: Partial<MetatronsCubeProps>
): VisualSystemProps {
  // First normalize the MetatronsCube nodes and connections
  const normalizedNodes = normalizeNodes(props.nodes || []);
  const normalizedConnections = normalizeConnections(props.connections || []);
  
  // Then convert them to VisualSystem types
  const visualNodes = normalizedNodes.map(convertToVisualSystemNode);
  const visualConnections = normalizedConnections.map(convertToVisualSystemConnection);
  
  return createVisualSystemProps({
    nodes: visualNodes,
    connections: visualConnections,
    variant: props.variant,
    size: props.size,
    qualityLevel: props.qualityLevel,
    withAnimation: props.withAnimation,
    intensity: props.intensity,
    activeNodeId: props.activeNodeId,
    onNodeClick: props.onNodeClick,
    className: props.className
  });
}

/**
 * Converts VisualSystem props to MetatronsCube props
 */
export function convertVisualSystemPropsToMetatronsCubeProps(
  props: VisualSystemProps
): MetatronsCubeProps {
  // Convert nodes and connections
  const metatronsNodes = props.nodes.map(convertToMetatronsNode);
  const metatronsConnections = props.connections.map(convertToMetatronsConnection);
  
  return {
    nodes: metatronsNodes,
    connections: metatronsConnections,
    variant: props.variant,
    size: props.size,
    qualityLevel: props.qualityLevel,
    withAnimation: props.withAnimation,
    intensity: props.intensity,
    activeNodeId: props.activeNodeId,
    onNodeClick: props.onNodeClick,
    className: props.className
  };
}

/**
 * Creates a node lookup map for efficient access
 */
export function createNodeLookupMap(nodes: VisualSystemNode[]): Record<string, VisualSystemNode> {
  return nodes.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {} as Record<string, VisualSystemNode>);
}

/**
 * Gets theme-specific colors for a visual element
 */
export function getThemeColors(theme: CubeTheme = CubeThemes.DEFAULT) {
  return {
    primary: '#4F46E5',   // Default primary color
    secondary: '#818CF8', // Default secondary color
    // Add more theme-specific colors as needed
  };
}
