
import React from 'react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import SacredGeometryIconNode from '@/components/sacred-geometry/icons/SacredGeometryIconNode';

interface GeometryNodeProps {
  node: any;
  index: number;
  nodeStatus: {
    unlocked: boolean;
    threshold: number;
    level: number;
  };
  activeNode: string | null;
  hoverNode: string | null;
  onNodeClick: (node: any) => void;
  onNodeHover: (nodeId: string | null) => void;
}

// Map node IDs to sacred geometry types
const nodeTypeMap: Record<string, any> = {
  'meditation': 'flower-of-life',
  'chakras': 'sri-yantra',
  'energy': 'torus',
  'wisdom': 'tree-of-life',
  'astral': 'merkaba',
  'healing': 'vesica-piscis',
  'dreams': 'golden-spiral',
  'portal-center': 'metatron',
  'elements': 'pentagram',
  'consciousness': 'infinity',
  'reflection': 'seed-of-life',
  'guidance': 'octagram',
  'manifestation': 'hexagram',
  'default': 'platonic-solid'
};

// Map node IDs to colors
const nodeColorMap: Record<string, string> = {
  'meditation': 'from-quantum-300 to-quantum-600',
  'chakras': 'from-amber-400 to-amber-600',
  'energy': 'from-cyan-400 to-cyan-600',
  'wisdom': 'from-indigo-400 to-indigo-600',
  'astral': 'from-purple-400 to-purple-600',
  'healing': 'from-emerald-400 to-emerald-600',
  'dreams': 'from-blue-400 to-blue-600',
  'elements': 'from-orange-400 to-orange-600',
  'consciousness': 'from-violet-400 to-violet-600',
  'reflection': 'from-teal-400 to-teal-600',
  'guidance': 'from-sky-400 to-sky-600',
  'manifestation': 'from-pink-400 to-pink-600',
  'default': 'from-quantum-400 to-quantum-600'
};

const GeometryNodeComponent: React.FC<GeometryNodeProps> = ({
  node,
  index,
  nodeStatus,
  activeNode,
  hoverNode,
  onNodeClick,
  onNodeHover
}) => {
  const isActive = activeNode === node.id;
  const isHovered = hoverNode === node.id;
  
  // Get the color based on node ID or use default
  const nodeColor = nodeColorMap[node.id] || nodeColorMap.default;
  
  // Get the sacred geometry type based on node ID or use default
  const geometryType = nodeTypeMap[node.id] || nodeTypeMap.default;
  
  return (
    <motion.div
      className={cn(
        "absolute z-20 transform -translate-x-1/2 -translate-y-1/2",
        node.position,
        isActive ? "z-30" : "z-20"
      )}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: isActive ? 1.1 : 1,
      }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: index * 0.05
      }}
    >
      <SacredGeometryIconNode
        id={node.id}
        name={node.name || node.id.charAt(0).toUpperCase() + node.id.slice(1)}
        type={geometryType}
        description={node.description || "Sacred geometry pattern representing cosmic consciousness"}
        position=""
        color={nodeColor}
        isActive={isActive}
        isLocked={!nodeStatus.unlocked}
        hasDownloadables={!!node.downloadables && node.downloadables.length > 0}
        unlocked={nodeStatus.unlocked}
        onClick={() => onNodeClick(node)}
        onHover={onNodeHover}
      />
      
      {/* Pulse effect for active node */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-white/30 z-0"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.7, 0, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Hover effect */}
      {isHovered && nodeStatus.unlocked && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30 z-0"
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.6 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

export default GeometryNodeComponent;
