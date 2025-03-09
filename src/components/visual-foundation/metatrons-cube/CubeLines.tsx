
import React from 'react';
import { motion } from 'framer-motion';
import { CubeTheme } from './types';

export interface CubeLinesProps {
  connections: {
    id: string;
    from: string;
    to: string;
    [key: string]: any;
  }[];
  nodes: Record<string, { x: number; y: number }>;
  activeNodeId?: string;
  variant?: CubeTheme;
  withAnimation?: boolean;
  intensity?: number;
}

const getLineColor = (theme: CubeTheme = 'default', isActive: boolean = false): string => {
  const themes = {
    default: {
      active: 'rgba(167, 139, 250, 0.8)',
      inactive: 'rgba(167, 139, 250, 0.3)'
    },
    cosmic: {
      active: 'rgba(129, 140, 248, 0.8)',
      inactive: 'rgba(129, 140, 248, 0.3)'
    },
    ethereal: {
      active: 'rgba(236, 72, 153, 0.8)',
      inactive: 'rgba(236, 72, 153, 0.3)'
    },
    quantum: {
      active: 'rgba(6, 182, 212, 0.8)',
      inactive: 'rgba(6, 182, 212, 0.3)'
    }
  };

  return isActive 
    ? themes[theme].active 
    : themes[theme].inactive;
};

const CubeLines: React.FC<CubeLinesProps> = ({ 
  connections, 
  nodes, 
  activeNodeId,
  variant = 'default',
  withAnimation = false,
  intensity = 5
}) => {
  const nodeConnections = connections.map(connection => {
    const fromNode = nodes[connection.from];
    const toNode = nodes[connection.to];
    
    if (!fromNode || !toNode) return null;
    
    const isActive = activeNodeId && 
      (connection.from === activeNodeId || connection.to === activeNodeId);
    
    // Line thickness based on intensity and active state
    const strokeWidth = isActive 
      ? Math.min(2 + intensity * 0.1, 3)  
      : Math.max(0.5, intensity * 0.08);

    // Line opacity based on active state
    const opacity = isActive 
      ? 0.8 + (intensity * 0.02)
      : 0.3 + (intensity * 0.01);
    
    const lineColor = getLineColor(variant, isActive);

    // Animation variants for the lines
    const variants = {
      active: { 
        opacity: opacity + 0.2,
        strokeWidth: strokeWidth + 0.5
      },
      inactive: { 
        opacity,
        strokeWidth
      }
    };

    return (
      <motion.line
        key={connection.id}
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke={lineColor}
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
        initial="inactive"
        animate={isActive ? "active" : "inactive"}
        variants={withAnimation ? variants : undefined}
        transition={{ duration: 0.3 }}
      />
    );
  });

  return <>{nodeConnections}</>;
};

export default CubeLines;
