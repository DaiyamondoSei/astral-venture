
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import SacredGeometryIconNode from '../icons/SacredGeometryIconNode';
import { GeometryNode as GeometryNodeType, NodeStatus } from '../types/geometry';

// Map node IDs to sacred geometry icon types
const nodeIconMap: Record<string, any> = {
  'meditation': 'flower-of-life',
  'chakras': 'sri-yantra', 
  'dreams': 'torus',
  'energy': 'merkaba',
  'reflection': 'vesica-piscis',
  'healing': 'golden-spiral',
  'wisdom': 'tree-of-life',
  'astral': 'octagram',
  'sacred': 'metatron',
  'elements': 'pentagram',
  'consciousness': 'infinity',
  'nature': 'seed-of-life',
  'guidance': 'hexagram',
  'sound': 'torus',
  'user': 'flower-of-life',
  'cosmic-center': 'platonic-solid'
};

// Precise positioning classes for each node on the Metatron's Cube
const nodePositionMap: Record<string, string> = {
  'meditation': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', // center
  'chakras': 'absolute top-[10%] left-1/2 -translate-x-1/2', // top
  'dreams': 'absolute top-[18%] right-[27%]', // top-right inner
  'energy': 'absolute bottom-[18%] right-[27%]', // bottom-right inner
  'reflection': 'absolute bottom-[10%] left-1/2 -translate-x-1/2', // bottom
  'healing': 'absolute bottom-[18%] left-[27%]', // bottom-left inner
  'wisdom': 'absolute top-[18%] left-[27%]', // top-left inner
  'astral': 'absolute top-[27%] left-[18%]', // top-left outer
  'sacred': 'absolute top-[27%] right-[18%]', // top-right outer
  'elements': 'absolute bottom-[27%] right-[18%]', // bottom-right outer
  'consciousness': 'absolute bottom-[27%] left-[18%]', // bottom-left outer
  'nature': 'absolute right-[10%] top-1/2 -translate-y-1/2', // right
  'guidance': 'absolute left-[10%] top-1/2 -translate-y-1/2', // left
  'sound': 'absolute top-[40%] right-[12%]', // right upper
  'user': 'absolute bottom-[40%] left-[12%]', // left lower
};

interface GeometryNodeProps {
  node: GeometryNodeType;
  index: number;
  nodeStatus: NodeStatus;
  activeNode: string | null;
  hoverNode: string | null;
  onNodeClick: (node: GeometryNodeType) => void;
  onNodeHover: (nodeId: string | null) => void;
}

const GeometryNodeComponent: React.FC<GeometryNodeProps> = ({
  node,
  index,
  nodeStatus,
  activeNode,
  hoverNode,
  onNodeClick,
  onNodeHover
}) => {
  const hasDownloadables = node.downloadables && node.downloadables.length > 0;
  
  // Get the sacred geometry icon type for this node
  const iconType = nodeIconMap[node.id] || 'metatron';
  
  // Get the precise position for this node
  const positionClass = nodePositionMap[node.id] || node.position;
  
  // Create a node with the position
  const nodeWithPosition = {
    ...node,
    position: positionClass
  };
  
  return (
    <SacredGeometryIconNode
      id={node.id}
      name={node.name}
      type={iconType}
      description={node.description}
      position={positionClass}
      color={node.color}
      isActive={activeNode === node.id}
      isLocked={!nodeStatus.unlocked}
      hasDownloadables={hasDownloadables}
      unlocked={nodeStatus.unlocked}
      onClick={() => onNodeClick(node)}
      onHover={onNodeHover}
    />
  );
};

export default GeometryNodeComponent;
