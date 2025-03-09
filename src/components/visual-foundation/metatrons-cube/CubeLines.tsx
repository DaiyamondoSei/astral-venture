
import React from 'react';
import { CubeConnection, MetatronsNode, GlowIntensity } from './MetatronsCube';

interface CubeLinesProps {
  connections: CubeConnection[];
  nodes: MetatronsNode[];
  primaryColor: string;
  secondaryColor: string;
  activeNodeId?: string;
  glowIntensity: GlowIntensity;
  isSimplified: boolean;
}

const CubeLines: React.FC<CubeLinesProps> = ({
  connections,
  nodes,
  primaryColor,
  secondaryColor,
  activeNodeId,
  glowIntensity,
  isSimplified
}) => {
  // Create a map of nodes by id for easy lookup
  const nodeMap = new Map<string, MetatronsNode>();
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  // Calculate SVG size based on the bounding box of all nodes
  const getSvgSize = () => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    
    nodes.forEach(node => {
      minX = Math.min(minX, node.x - 5);
      maxX = Math.max(maxX, node.x + 5);
      minY = Math.min(minY, node.y - 5);
      maxY = Math.max(maxY, node.y + 5);
    });
    
    return {
      width: maxX - minX + 10,
      height: maxY - minY + 10,
      viewBox: `${minX - 5} ${minY - 5} ${maxX - minX + 10} ${maxY - minY + 10}`
    };
  };
  
  const svgSize = getSvgSize();
  
  // Set filter intensity based on the glowIntensity prop
  const getFilterDeviation = () => {
    switch (glowIntensity) {
      case 'low': return '1.5';
      case 'medium': return '2.5';
      case 'high': return '4';
      default: return '2.5';
    }
  };
  
  return (
    <svg
      width={svgSize.width}
      height={svgSize.height}
      viewBox={svgSize.viewBox}
      className="absolute pointer-events-none"
    >
      <defs>
        <filter id="glow-line" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={getFilterDeviation()} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Draw connections between nodes */}
      {connections.map((connection, index) => {
        const source = nodeMap.get(connection.source);
        const target = nodeMap.get(connection.target);
        
        if (!source || !target) return null;
        
        const isActive = connection.active || 
                         source.id === activeNodeId || 
                         target.id === activeNodeId;
        
        return (
          <line
            key={`${connection.source}-${connection.target}-${index}`}
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            stroke={isActive ? secondaryColor : primaryColor}
            strokeWidth={isActive ? 1.5 : 0.8}
            strokeOpacity={isActive ? 0.8 : 0.5}
            filter={isSimplified ? '' : 'url(#glow-line)'}
          />
        );
      })}
    </svg>
  );
};

export default CubeLines;
