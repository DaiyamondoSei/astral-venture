
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePerfConfig } from '@/hooks/usePerfConfig';

interface MetatronsCubeProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
  glowColor?: string;
  glowIntensity?: 'none' | 'low' | 'medium' | 'high';
  interactive?: boolean;
  spinSpeed?: number;
  nodeColor?: string;
  activeNodeColor?: string;
  onNodeClick?: (nodeId: number) => void;
  activeNodes?: number[];
  className?: string;
}

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
  
  // Calculate glow filter based on intensity
  const getGlowFilter = () => {
    if (glowIntensity === 'none' || !config.enableGlow) return '';
    
    const intensityMap = {
      low: 3,
      medium: 6,
      high: 10
    };
    
    return `drop-shadow(0 0 ${intensityMap[glowIntensity]}px ${glowColor})`;
  };

  // Node positions in the Metatron's Cube
  const getCubeNodes = () => {
    const center = size / 2;
    const radius = size * 0.4;
    
    // Central node
    const nodes = [{ id: 0, x: center, y: center }];
    
    // Inner hexagon (6 nodes)
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      nodes.push({
        id: i + 1,
        x: center + radius * 0.5 * Math.cos(angle),
        y: center + radius * 0.5 * Math.sin(angle)
      });
    }
    
    // Outer hexagon (6 nodes)
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      nodes.push({
        id: i + 7,
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle)
      });
    }
    
    return nodes;
  };
  
  const nodes = getCubeNodes();
  
  // Generate lines connecting the nodes
  const generateLines = () => {
    const lines = [];
    
    // Connect center to inner hexagon
    for (let i = 1; i <= 6; i++) {
      lines.push({ from: 0, to: i });
    }
    
    // Connect inner hexagon nodes to each other
    for (let i = 1; i <= 6; i++) {
      lines.push({ from: i, to: i === 6 ? 1 : i + 1 });
    }
    
    // Connect inner hexagon to outer hexagon
    for (let i = 1; i <= 6; i++) {
      lines.push({ from: i, to: i + 6 });
    }
    
    // Connect outer hexagon nodes to each other
    for (let i = 7; i <= 12; i++) {
      lines.push({ from: i, to: i === 12 ? 7 : i + 1 });
    }
    
    // Connect additional inner lines for the full Metatron's Cube
    lines.push({ from: 1, to: 9 });
    lines.push({ from: 1, to: 11 });
    lines.push({ from: 2, to: 10 });
    lines.push({ from: 2, to: 12 });
    lines.push({ from: 3, to: 11 });
    lines.push({ from: 3, to: 7 });
    lines.push({ from: 4, to: 12 });
    lines.push({ from: 4, to: 8 });
    lines.push({ from: 5, to: 7 });
    lines.push({ from: 5, to: 9 });
    lines.push({ from: 6, to: 8 });
    lines.push({ from: 6, to: 10 });
    
    return lines;
  };
  
  const lines = generateLines();

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
  const enableAnimations = !config.enableComplexAnimations ? false : true;

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
        filter: getGlowFilter()
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
      >
        {/* Draw the connecting lines */}
        <g>
          {lines.map((line, index) => {
            const fromNode = nodes.find(n => n.id === line.from);
            const toNode = nodes.find(n => n.id === line.to);
            
            if (!fromNode || !toNode) return null;
            
            return (
              <line
                key={`line-${index}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeOpacity={0.7}
              />
            );
          })}
        </g>
        
        {/* Draw the nodes */}
        <g>
          {nodes.map((node) => {
            const isActive = activeNodes.includes(node.id);
            const isHovered = hoveredNode === node.id;
            const nodeSize = node.id === 0 ? 6 : isActive ? 5 : 3;
            
            return (
              <g key={`node-${node.id}`}>
                {/* Outer glow for active nodes */}
                {(isActive || isHovered) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize * 2}
                    fill={activeNodeColor}
                    opacity={0.4}
                  />
                )}
                
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeSize}
                  fill={isActive ? activeNodeColor : nodeColor}
                  style={{ cursor: interactive ? 'pointer' : 'default' }}
                  onClick={() => interactive && onNodeClick && onNodeClick(node.id)}
                  onMouseEnter={() => interactive && setHoveredNode(node.id)}
                  onMouseLeave={() => interactive && setHoveredNode(null)}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </motion.div>
  );
};

export default MetatronsCube;
