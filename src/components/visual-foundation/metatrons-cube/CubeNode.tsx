
import React from 'react';
import { motion } from 'framer-motion';
import { CubeNodeProps } from './types';

/**
 * CubeNode renders a single node in the cube
 */
const CubeNode: React.FC<CubeNodeProps> = ({
  node,
  primaryColor,
  secondaryColor,
  isActive = false,
  onClick,
  glowIntensity,
  isSimplified
}) => {
  // Set filter intensity based on the glowIntensity prop
  const getFilterDeviation = () => {
    switch (glowIntensity) {
      case 'low': return '2';
      case 'medium': return '3';
      case 'high': return '5';
      default: return '3';
    }
  };
  
  // Determine node size
  const nodeSize = node.size || (isActive ? 16 : 12);
  
  // Position styles
  const positionStyles = {
    transform: `translate(${node.x}px, ${node.y}px)`,
  };
  
  // Animation variants
  const variants = {
    active: {
      scale: [1, 1.15, 1],
      transition: { 
        duration: 2, 
        repeat: Infinity,
        repeatType: 'loop' as const
      }
    },
    inactive: {
      scale: 1
    }
  };
  
  const handleNodeClick = () => {
    onClick(node.id);
  };
  
  return (
    <motion.g
      style={positionStyles}
      variants={variants}
      animate={node.pulsing ? 'active' : 'inactive'}
      whileHover={{ scale: 1.2 }}
      onClick={handleNodeClick}
      title={node.tooltip}
      className="cursor-pointer"
    >
      <circle
        cx="0"
        cy="0"
        r={nodeSize / 2}
        fill={isActive ? secondaryColor : primaryColor}
        style={{
          filter: isSimplified ? undefined : `drop-shadow(0 0 ${getFilterDeviation()}px ${isActive ? secondaryColor : primaryColor})`
        }}
      />
      
      {node.label && (
        <text
          x="0"
          y={nodeSize + 8}
          textAnchor="middle"
          className="fill-white text-xs font-medium pointer-events-none"
          style={{
            textShadow: '0 0 4px rgba(0,0,0,0.8)'
          }}
        >
          {node.label}
        </text>
      )}
    </motion.g>
  );
};

export default CubeNode;
