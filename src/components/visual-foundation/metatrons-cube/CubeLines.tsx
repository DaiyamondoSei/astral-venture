
import React from 'react';
import { CubeLinesProps } from './types';

/**
 * CubeLines renders the connections between nodes in the cube
 */
const CubeLines: React.FC<CubeLinesProps> = ({
  connections,
  nodes,
  primaryColor,
  secondaryColor,
  activeNodeId,
  glowIntensity,
  isSimplified
}) => {
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
    <>
      <defs>
        <filter id="glow-line" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={getFilterDeviation()} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Draw connections between nodes */}
      {connections.map((connection, index) => {
        const source = nodes[connection.source];
        const target = nodes[connection.target];
        
        if (!source || !target) return null;
        
        const isActive = connection.active || 
                         connection.source === activeNodeId || 
                         connection.target === activeNodeId;
        
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
            filter={isSimplified ? undefined : 'url(#glow-line)'}
          />
        );
      })}
    </>
  );
};

export default CubeLines;
