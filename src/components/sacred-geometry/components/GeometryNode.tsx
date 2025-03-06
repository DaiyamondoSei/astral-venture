
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
  'cosmic-center': 'platonic-solid'
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
  
  return (
    <SacredGeometryIconNode
      id={node.id}
      name={node.name}
      type={iconType}
      description={node.description}
      position={node.position}
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
