
import { CubeNode, CubeLine } from './types';

// Generates a centered grid of nodes for Metatron's Cube
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

// Generate connections between nodes
export const generateMetatronsConnections = (nodes: CubeNode[]): CubeLine[] => {
  const connections: CubeLine[] = [];
  
  // Connect each node to all others (for small counts)
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
    // For larger counts, be more selective to avoid visual clutter
    // Connect center to all
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
    }
  }
  
  return connections;
};

// Generate sample data for demonstration
export const generateSampleMetatronsData = (nodeCount: number = 7) => {
  const nodes = generateMetatronsNodes(nodeCount);
  const connections = generateMetatronsConnections(nodes);
  
  return { nodes, connections };
};

// Predefined node configurations
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
