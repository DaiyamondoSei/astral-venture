import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MetatronsNode, MetatronsConnection, GlowIntensity } from './types';

interface CubeLinesProps {
  connections: MetatronsConnection[];
  nodes: MetatronsNode[];
  primaryColor: string;
  secondaryColor: string;
  activeNodeId?: string;
  glowIntensity: GlowIntensity;
  isSimplified?: boolean;
}

// Get line coordinates between two nodes
const getLineCoordinates = (
  fromNode: MetatronsNode,
  toNode: MetatronsNode,
  svgSize: number = 200
): { x1: number; y1: number; x2: number; y2: number } => {
  const x1 = (fromNode.x / 100) * svgSize;
  const y1 = (fromNode.y / 100) * svgSize;
  const x2 = (toNode.x / 100) * svgSize;
  const y2 = (toNode.y / 100) * svgSize;
  
  return { x1, y1, x2, y2 };
};

const CubeLines: React.FC<CubeLinesProps> = ({
  connections,
  nodes,
  primaryColor,
  secondaryColor,
  activeNodeId,
  glowIntensity,
  isSimplified = false
}) => {
  // Define filter ID based on glow intensity
  const filterId = `line-glow-${glowIntensity}`;
  
  // Define SVG size (viewBox dimensions)
  const svgSize = 200;
  
  // Optimize connections - skip some for low-end devices
  const optimizedConnections = useMemo(() => {
    if (isSimplified) {
      // For simplified rendering, keep only connections to active node
      // and a subset of the remaining connections
      return connections.filter((conn) => 
        conn.from === activeNodeId || 
        conn.to === activeNodeId || 
        // Keep only 50% of non-active connections for performance
        Math.random() > 0.5
      );
    }
    return connections;
  }, [connections, activeNodeId, isSimplified]);
  
  return (
    <svg
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      className="absolute inset-0 w-full h-full"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={isSimplified ? "1" : glowIntensity === 'high' ? "2.5" : glowIntensity === 'medium' ? "2" : "1.5"} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <g>
        {optimizedConnections.map((connection) => {
          const fromNode = nodes.find((n) => n.id === connection.from);
          const toNode = nodes.find((n) => n.id === connection.to);
          
          if (!fromNode || !toNode) return null;
          
          const { x1, y1, x2, y2 } = getLineCoordinates(fromNode, toNode, svgSize);
          
          const isActive = fromNode.id === activeNodeId || toNode.id === activeNodeId;
          
          return (
            <motion.line
              key={connection.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={cn(
                "transition-opacity duration-500",
                isActive ? "opacity-80" : "opacity-40"
              )}
              stroke={isActive ? primaryColor : secondaryColor}
              strokeWidth={isActive ? 1.5 : 1}
              filter={isActive && !isSimplified ? `url(#${filterId})` : undefined}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          );
        })}
      </g>
    </svg>
  );
};

export default CubeLines;
