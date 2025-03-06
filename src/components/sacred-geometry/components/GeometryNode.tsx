
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import GlowEffect from '@/components/GlowEffect';
import { Download } from 'lucide-react';
import { GeometryNode as GeometryNodeType, NodeStatus } from '../types/geometry';

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
  
  return (
    <motion.div
      key={node.id}
      className={cn(
        "absolute",
        node.position,
        "z-10"
      )}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: nodeStatus.unlocked ? 1 : 0.5,
        scale: activeNode === node.id ? 1.1 : 1
      }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <GlowEffect 
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center cursor-pointer",
          "transition-all duration-300",
          nodeStatus.unlocked ? "bg-black/30" : "bg-black/50",
          hasDownloadables && "ring-2 ring-white/30 ring-offset-2 ring-offset-transparent"
        )}
        color={nodeStatus.unlocked ? `${node.color.split(' ')[1]}80` : "rgba(100,100,100,0.3)"}
        intensity={activeNode === node.id ? "high" : "medium"}
        animation={activeNode === node.id ? "pulse" : "none"}
        interactive={nodeStatus.unlocked}
        onClick={() => onNodeClick(node)}
        onMouseEnter={() => onNodeHover(node.id)}
        onMouseLeave={() => onNodeHover(null)}
      >
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          "bg-gradient-to-br",
          nodeStatus.unlocked ? node.color : "from-gray-600 to-gray-700",
          "relative"
        )}>
          {node.icon}
          
          {/* Download indicator */}
          {hasDownloadables && nodeStatus.unlocked && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <Download size={12} className="text-quantum-600" />
            </div>
          )}
        </div>
        
        {/* Tooltip */}
        {hoverNode === node.id && (
          <motion.div 
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-black/70 rounded text-center z-20"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="font-semibold text-white">{node.name}</div>
            <div className="text-xs text-white/80 mt-1">{node.description}</div>
            {hasDownloadables && nodeStatus.unlocked && (
              <div className="text-xs text-quantum-300 mt-1 flex items-center justify-center">
                <Download size={10} className="mr-1" />
                {node.downloadables?.length} materials available
              </div>
            )}
            {!nodeStatus.unlocked && (
              <div className="text-xs text-amber-400 mt-1">
                Unlocks at {nodeStatus.threshold} energy points
              </div>
            )}
          </motion.div>
        )}
      </GlowEffect>
    </motion.div>
  );
};

export default GeometryNodeComponent;
