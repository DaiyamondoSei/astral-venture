
import React from 'react';
import { GeometryNode } from '../types/geometry';
import downloadableMaterials from './materialData';
import { allNodeCategories } from './nodeCategories';
import nodeColors from './nodeColors';
import nodeIcons from './nodeIcons';
import nodeDescriptions from './nodeDescriptions';

// Define the sacred geometry nodes with complete functionality mapping
export const createGeometryNodes = (onSelectNode?: (nodeId: string, downloadables?: any[]) => void): GeometryNode[] => {
  const nodes: GeometryNode[] = [];
  
  // Create nodes from all categories
  Object.keys(allNodeCategories).forEach(categoryId => {
    const functionalities = allNodeCategories[categoryId].functionalities.map(f => f.name);
    
    nodes.push({
      id: categoryId,
      name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1), // Capitalize first letter
      icon: nodeIcons[categoryId as keyof typeof nodeIcons],
      description: nodeDescriptions[categoryId as keyof typeof nodeDescriptions],
      color: nodeColors[categoryId as keyof typeof nodeColors],
      position: '', // This will be filled by the precise positioning class in GeometryNode.tsx
      downloadables: downloadableMaterials[categoryId],
      action: () => onSelectNode?.(categoryId, downloadableMaterials[categoryId]),
      functionalities
    });
  });
  
  return nodes;
};

export default createGeometryNodes;
