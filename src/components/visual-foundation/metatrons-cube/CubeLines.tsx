
import React from 'react';
import { CubeLine, CubeNode } from './types';

interface CubeLinesProps {
  lines: CubeLine[];
  nodes: CubeNode[];
  color: string;
  strokeWidth: number;
}

const CubeLines: React.FC<CubeLinesProps> = ({
  lines,
  nodes,
  color,
  strokeWidth
}) => {
  return (
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
  );
};

export default CubeLines;
