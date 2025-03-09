
import React from 'react';

interface CubeNodeProps {
  x: number;
  y: number;
  id: number;
  size: number;
  isActive: boolean;
  isHovered: boolean;
  nodeColor: string;
  activeNodeColor: string;
  interactive: boolean;
  onNodeClick?: (nodeId: number) => void;
  onNodeHover?: (nodeId: number | null) => void;
}

const CubeNode: React.FC<CubeNodeProps> = ({
  x,
  y,
  id,
  size,
  isActive,
  isHovered,
  nodeColor,
  activeNodeColor,
  interactive,
  onNodeClick,
  onNodeHover
}) => {
  const nodeSize = id === 0 ? 6 : isActive ? 5 : 3;
  
  return (
    <g key={`node-${id}`}>
      {/* Outer glow for active nodes */}
      {(isActive || isHovered) && (
        <circle
          cx={x}
          cy={y}
          r={nodeSize * 2}
          fill={activeNodeColor}
          opacity={0.4}
        />
      )}
      
      {/* Node circle */}
      <circle
        cx={x}
        cy={y}
        r={nodeSize}
        fill={isActive ? activeNodeColor : nodeColor}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
        onClick={() => interactive && onNodeClick && onNodeClick(id)}
        onMouseEnter={() => interactive && onNodeHover && onNodeHover(id)}
        onMouseLeave={() => interactive && onNodeHover && onNodeHover(null)}
      />
    </g>
  );
};

export default CubeNode;
