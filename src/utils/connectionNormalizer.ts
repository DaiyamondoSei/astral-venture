
import { MetatronsConnection, MetatronsNode } from '@/components/visual-foundation/metatrons-cube/types';

/**
 * Normalizes connection structure by ensuring each connection has both 
 * from/to and source/target properties with consistent values
 */
export function normalizeConnections(connections: Partial<MetatronsConnection>[]): MetatronsConnection[] {
  return connections.map((connection, index) => {
    // Create a consistent id if none exists
    const id = connection.id || `connection-${index}`;
    
    // Normalize source and target properties
    const source = connection.source || connection.from || '';
    const target = connection.target || connection.to || '';
    
    // Create a fully normalized connection
    return {
      id,
      source,
      target,
      from: source,
      to: target,
      active: connection.active || false,
      animated: connection.animated || false,
      width: connection.width || 1
    };
  });
}

/**
 * Ensures all node objects have the required properties with default values
 */
export function normalizeNodes(nodes: Partial<MetatronsNode>[]): MetatronsNode[] {
  return nodes.map((node, index) => {
    return {
      id: node.id || `node-${index}`,
      x: node.x || 0,
      y: node.y || 0,
      radius: node.radius || 5,
      size: node.size || 5,
      label: node.label || '',
      tooltip: node.tooltip || node.label || '',
      active: node.active || false,
      pulsing: node.pulsing || false
    };
  });
}

/**
 * Converts an array of nodes to a record for faster lookup
 */
export function nodesToRecord(nodes: MetatronsNode[]): Record<string, MetatronsNode> {
  return nodes.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {} as Record<string, MetatronsNode>);
}

/**
 * Converts a from/to connection format to a source/target format
 */
export function convertConnectionFormat(connections: { from: string; to: string }[]): MetatronsConnection[] {
  return connections.map((conn, index) => ({
    id: `connection-${index}`,
    source: conn.from,
    target: conn.to,
    from: conn.from,
    to: conn.to,
    active: false,
    animated: false,
    width: 1
  }));
}
