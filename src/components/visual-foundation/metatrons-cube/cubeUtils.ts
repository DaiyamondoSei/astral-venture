
import { CubeNode, CubeLine } from './types';

/**
 * Generates a centered grid of nodes for Metatron's Cube
 * @param count Number of nodes to generate
 * @param radius Radius of the circle on which nodes are placed
 * @returns Array of node objects
 */
export const generateMetatronsNodes = (count: number = 7, radius: number = 150): CubeNode[] => {
  const nodes: CubeNode[] = [];
  
  // Always add center node
  nodes.push({
    id: "node-0",
    x: 200,
    y: 200,
    radius: 5
  });
  
  if (count <= 1) return nodes;
  
  // Add nodes in a circular pattern
  const angleIncrement = (2 * Math.PI) / (count - 1);
  for (let i = 1; i < count; i++) {
    const angle = i * angleIncrement;
    nodes.push({
      id: `node-${i}`,
      x: 200 + radius * Math.cos(angle),
      y: 200 + radius * Math.sin(angle),
      radius: 5
    });
  }
  
  return nodes;
};

/**
 * Generate connections between nodes with optimized generation based on node count
 * @param nodes Array of cube nodes to connect
 * @returns Array of connections between nodes
 */
export const generateMetatronsConnections = (nodes: CubeNode[]): CubeLine[] => {
  const connections: CubeLine[] = [];
  
  // For small node counts, create a fully connected graph
  if (nodes.length <= 9) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        connections.push({
          id: `connection-${i}-${j}`,
          from: nodes[i].id,
          to: nodes[j].id
        });
      }
    }
  } else {
    // For larger counts, use a more selective connection pattern
    // to avoid visual clutter and improve performance
    
    // Connect center to all outer nodes
    for (let i = 1; i < nodes.length; i++) {
      connections.push({
        id: `connection-0-${i}`,
        from: nodes[0].id,
        to: nodes[i].id
      });
    }
    
    // Connect adjacent nodes in outer circle
    for (let i = 1; i < nodes.length; i++) {
      const nextIndex = i === nodes.length - 1 ? 1 : i + 1;
      connections.push({
        id: `connection-${i}-${nextIndex}`,
        from: nodes[i].id,
        to: nodes[nextIndex].id
      });
      
      // Add some cross-connections for visual interest
      // but skip some to avoid excessive density
      if (i % 2 === 0 && i + 2 < nodes.length) {
        connections.push({
          id: `connection-${i}-${i+2}`,
          from: nodes[i].id,
          to: nodes[i+2].id
        });
      }
    }
  }
  
  return connections;
};

/**
 * Generate sample data for demonstration and testing
 * @param nodeCount Number of nodes to generate
 * @returns Object with nodes and connections
 */
export const generateSampleMetatronsData = (nodeCount: number = 7) => {
  const nodes = generateMetatronsNodes(nodeCount);
  const connections = generateMetatronsConnections(nodes);
  
  return { nodes, connections };
};

/**
 * Predefined node configurations for common use cases
 */
export const nodeConfigurations = {
  basic: generateMetatronsNodes(7, 150),
  expanded: generateMetatronsNodes(9, 170),
  complex: generateMetatronsNodes(12, 180)
};

export default {
  generateMetatronsNodes,
  generateMetatronsConnections,
  generateSampleMetatronsData,
  nodeConfigurations
};
