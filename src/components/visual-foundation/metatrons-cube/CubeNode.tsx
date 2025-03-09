
import React from 'react';
import { motion } from 'framer-motion';
import { CubeTheme, GlowIntensity } from './types';

export interface CubeNodeProps {
  node: {
    id: string;
    x: number;
    y: number;
    [key: string]: any;
  };
  isActive?: boolean;
  onClick?: () => void;
  variant?: CubeTheme;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  withAnimation?: boolean;
  intensity?: number;
}

const getNodeSize = (size: string = 'md'): number => {
  const sizes = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 24
  };
  return sizes[size as keyof typeof sizes] || sizes.md;
};

const getNodeColor = (theme: CubeTheme = 'default', isActive: boolean = false): string => {
  const themes = {
    default: {
      active: 'rgb(167, 139, 250)',
      inactive: 'rgb(139, 92, 246, 0.5)'
    },
    cosmic: {
      active: 'rgb(129, 140, 248)',
      inactive: 'rgb(129, 140, 248, 0.5)'
    },
    ethereal: {
      active: 'rgb(236, 72, 153)',
      inactive: 'rgb(236, 72, 153, 0.5)'
    },
    quantum: {
      active: 'rgb(6, 182, 212)',
      inactive: 'rgb(6, 182, 212, 0.5)'
    }
  };

  return isActive 
    ? themes[theme].active 
    : themes[theme].inactive;
};

const getGlowIntensity = (intensity: number = 5): GlowIntensity => {
  if (intensity <= 3) return 'low';
  if (intensity <= 7) return 'medium';
  return 'high';
};

const CubeNode: React.FC<CubeNodeProps> = ({ 
  node, 
  isActive = false, 
  onClick,
  variant = 'default',
  size = 'md',
  withAnimation = false,
  intensity = 5
}) => {
  const nodeSize = getNodeSize(size);
  const nodeColor = getNodeColor(variant, isActive);
  const glowIntensity = getGlowIntensity(intensity);
  
  // Calculate glow filter based on intensity
  const getGlowFilter = () => {
    const intensityMap = {
      low: 'blur(2px)',
      medium: 'blur(4px)',
      high: 'blur(6px)'
    };
    
    return intensityMap[glowIntensity];
  };

  // Animation variants based on active state
  const variants = {
    active: { 
      scale: 1.2, 
      filter: `drop-shadow(0 0 ${nodeSize/2}px ${nodeColor})` 
    },
    inactive: { 
      scale: 1,
      filter: `drop-shadow(0 0 ${nodeSize/4}px ${nodeColor})`
    }
  };

  return (
    <motion.circle
      cx={node.x}
      cy={node.y}
      r={nodeSize / 2}
      fill={nodeColor}
      filter={`drop-shadow(0 0 ${nodeSize/4}px ${nodeColor})`}
      initial="inactive"
      animate={isActive ? "active" : "inactive"}
      variants={withAnimation ? variants : undefined}
      transition={{ duration: 0.3 }}
      style={{ filter: `drop-shadow(0 0 ${nodeSize/3}px ${nodeColor})` }}
      onClick={onClick}
      className="cursor-pointer transition-all duration-300"
    />
  );
};

export default CubeNode;
