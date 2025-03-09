
import React, { useMemo } from 'react';
import { MetatronsCubeProps, MetatronsNode } from './types';
import CubeLines from './CubeLines';
import CubeNode from './CubeNode';

const CubeRenderer: React.FC<MetatronsCubeProps> = ({
  nodes,
  connections,
  activeNodeId,
  onNodeClick,
  variant = 'default',
  size = 'md',
  withAnimation = false,
  intensity = 5
}) => {
  // Convert nodes array to a lookup object for faster access
  const nodesLookup = useMemo(() => {
    return nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {} as Record<string, MetatronsNode>);
  }, [nodes]);
  
  // Create a mapping of node id to position for the CubeLines component
  const nodePositions = useMemo(() => {
    return nodes.reduce((acc, node) => {
      acc[node.id] = { x: node.x, y: node.y };
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
  }, [nodes]);

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 400 400" 
      className="w-full h-full"
    >
      {/* Draw connection lines */}
      <CubeLines
        connections={connections}
        nodes={nodePositions}
        activeNodeId={activeNodeId}
        variant={variant}
        withAnimation={withAnimation}
        intensity={intensity}
      />
      
      {/* Draw nodes */}
      {nodes.map(node => (
        <CubeNode
          key={node.id}
          node={node}
          isActive={activeNodeId === node.id}
          onClick={() => onNodeClick?.(node.id)}
          variant={variant}
          size={size}
          withAnimation={withAnimation}
          intensity={intensity}
        />
      ))}
    </svg>
  );
};

export default CubeRenderer;
