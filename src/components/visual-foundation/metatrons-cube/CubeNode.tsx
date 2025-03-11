
import React from 'react';
import { motion } from 'framer-motion';
import { CubeNodeProps } from './types';

const CubeNode: React.FC<CubeNodeProps> = ({
  node,
  primaryColor,
  secondaryColor,
  isActive,
  onClick,
  glowIntensity,
  isSimplified,
}) => {
  // Set node radius and filter based on glow intensity
  const baseRadius = node.radius || (node.size || 5);
  let nodeRadius = isActive ? baseRadius * 1.2 : baseRadius;
  let glowFilter = '';
  let fillOpacity = isActive ? 0.9 : 0.6;

  switch (glowIntensity) {
    case 'high':
      glowFilter = isActive ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' : '';
      fillOpacity = isActive ? 1 : 0.7;
      nodeRadius = isActive ? baseRadius * 1.3 : baseRadius;
      break;
    case 'medium':
      glowFilter = isActive ? 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.6))' : '';
      fillOpacity = isActive ? 0.9 : 0.6;
      nodeRadius = isActive ? baseRadius * 1.2 : baseRadius;
      break;
    case 'low':
      glowFilter = isActive ? 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.4))' : '';
      fillOpacity = isActive ? 0.8 : 0.5;
      nodeRadius = isActive ? baseRadius * 1.1 : baseRadius;
      break;
    case 'none':
      glowFilter = '';
      fillOpacity = isActive ? 0.7 : 0.4;
      nodeRadius = isActive ? baseRadius * 1.05 : baseRadius;
      break;
  }

  // Fixed animation variants to comply with framer-motion types
  const nodeVariants = {
    active: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    },
    inactive: {
      scale: 1
    }
  };

  return (
    <motion.g 
      transform={`translate(${node.x}, ${node.y})`}
      onClick={() => onClick(node.id)}
      initial={{ scale: 0.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.2 }}
      variants={nodeVariants}
      animate={node.pulsing ? "active" : "inactive"}
      style={{ filter: glowFilter }}
      className="cursor-pointer"
      title={node.tooltip || node.label}
    >
      <circle
        r={nodeRadius}
        fill={isActive ? primaryColor : secondaryColor}
        fillOpacity={fillOpacity}
        stroke={isActive ? primaryColor : secondaryColor}
        strokeOpacity={isActive ? 0.9 : 0.7}
        strokeWidth={isActive ? 1.5 : 0.8}
      />
      {!isSimplified && node.label && (
        <text
          textAnchor="middle"
          dy=".3em"
          fontSize={isActive ? "12px" : "10px"}
          fill={isActive ? "#ffffff" : "#e0e0e0"}
          fillOpacity={isActive ? 1 : 0.9}
          style={{ pointerEvents: 'none' }}
        >
          {node.label}
        </text>
      )}
    </motion.g>
  );
};

export default CubeNode;
