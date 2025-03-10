
import React from 'react';
import { motion } from 'framer-motion';
import { CubeLinesProps, MetatronsConnection } from './types';

const CubeLines: React.FC<CubeLinesProps> = ({
  connections,
  nodes,
  primaryColor,
  secondaryColor,
  activeNodeId,
  glowIntensity,
  isSimplified,
}) => {
  // Set stroke opacity based on glow intensity
  let strokeOpacity = 0.6;
  let activeStrokeOpacity = 0.9;
  let strokeWidth = 1;
  let activeStrokeWidth = 2;

  switch (glowIntensity) {
    case 'high':
      strokeOpacity = 0.7;
      activeStrokeOpacity = 1;
      strokeWidth = 1.5;
      activeStrokeWidth = 3;
      break;
    case 'medium':
      strokeOpacity = 0.6;
      activeStrokeOpacity = 0.9;
      strokeWidth = 1.2;
      activeStrokeWidth = 2.5;
      break;
    case 'low':
      strokeOpacity = 0.5;
      activeStrokeOpacity = 0.8;
      strokeWidth = 1;
      activeStrokeWidth = 2;
      break;
    case 'none':
      strokeOpacity = 0.4;
      activeStrokeOpacity = 0.7;
      strokeWidth = 0.8;
      activeStrokeWidth = 1.5;
      break;
  }

  const normalizeLinkId = (connection: MetatronsConnection) => {
    // Support both from/to and source/target naming formats
    const sourceId = connection.from || connection.source || '';
    const targetId = connection.to || connection.target || '';
    return `${sourceId}-${targetId}`;
  };

  return (
    <g className="metatrons-cube-lines">
      {connections.map((connection) => {
        const sourceId = connection.from || connection.source || '';
        const targetId = connection.to || connection.target || '';
        const sourceNode = nodes[sourceId];
        const targetNode = nodes[targetId];

        if (!sourceNode || !targetNode) return null;

        const isActive = activeNodeId === sourceId || activeNodeId === targetId;
        const linkId = normalizeLinkId(connection);

        return (
          <motion.line
            key={linkId}
            x1={sourceNode.x}
            y1={sourceNode.y}
            x2={targetNode.x}
            y2={targetNode.y}
            stroke={isActive ? primaryColor : secondaryColor}
            strokeWidth={isActive ? activeStrokeWidth : strokeWidth}
            strokeOpacity={isActive ? activeStrokeOpacity : strokeOpacity}
            initial={{ pathLength: 0 }}
            animate={connection.animated ? { pathLength: 1 } : {}}
            transition={{
              duration: 1.5,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </g>
  );
};

export default CubeLines;
