
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { MetatronsCubeProps } from './types';
import CubeLines from './CubeLines';
import CubeNode from './CubeNode';
import { getCubeNodes, generateCubeLines, getGlowFilter } from './cubeUtils';

const MetatronsCube: React.FC<MetatronsCubeProps> = ({
  size = 400,
  strokeWidth = 1,
  color = "rgba(255, 255, 255, 0.7)",
  glowColor = "rgba(139, 92, 246, 0.5)",
  glowIntensity = 'medium',
  interactive = false,
  spinSpeed = 1,
  nodeColor = "rgba(255, 255, 255, 0.8)",
  activeNodeColor = "#A855F7",
  onNodeClick,
  activeNodes = [],
  className = "",
}) => {
  const { config } = usePerfConfig();
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  
  // Get nodes and lines for the cube
  const nodes = getCubeNodes(size);
  const lines = generateCubeLines();

  // Animation variants
  const cubeVariants = {
    animate: {
      rotateZ: interactive ? 0 : [0, 360 * spinSpeed],
      transition: {
        duration: 180 / spinSpeed,
        repeat: Infinity,
        ease: "linear"
      }
    },
    hover: {
      scale: interactive ? 1.05 : 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };
  
  // Only use animations for medium and high performance settings
  const enableAnimations = config.enableComplexAnimations !== false;

  return (
    <motion.div 
      className={`relative ${className}`}
      initial="initial"
      animate={enableAnimations ? "animate" : undefined}
      whileHover={interactive ? "hover" : undefined}
      variants={cubeVariants}
      style={{
        width: size,
        height: size,
        filter: getGlowFilter(glowIntensity, glowColor, config.enableGlow !== false)
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
      >
        {/* Draw the connecting lines */}
        <CubeLines 
          lines={lines}
          nodes={nodes}
          color={color}
          strokeWidth={strokeWidth}
        />
        
        {/* Draw the nodes */}
        <g>
          {nodes.map((node) => (
            <CubeNode
              key={`node-${node.id}`}
              x={node.x}
              y={node.y}
              id={node.id}
              size={size}
              isActive={activeNodes.includes(node.id)}
              isHovered={hoveredNode === node.id}
              nodeColor={nodeColor}
              activeNodeColor={activeNodeColor}
              interactive={interactive}
              onNodeClick={onNodeClick}
              onNodeHover={setHoveredNode}
            />
          ))}
        </g>
      </svg>
    </motion.div>
  );
};

export default MetatronsCube;
