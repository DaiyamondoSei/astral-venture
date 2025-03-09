
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { cn } from '@/lib/utils';
import CubeRenderer from './CubeRenderer';
import { MetatronsCubeProps, CubeTheme, CubeSize } from './types';

const themeColors: Record<CubeTheme, { primary: string; secondary: string; background: string }> = {
  default: {
    primary: 'rgba(147, 51, 234, 0.7)',
    secondary: 'rgba(59, 130, 246, 0.7)',
    background: 'rgba(17, 24, 39, 0.4)'
  },
  cosmic: {
    primary: 'rgba(236, 72, 153, 0.7)',
    secondary: 'rgba(124, 58, 237, 0.7)',
    background: 'rgba(15, 23, 42, 0.45)'
  },
  ethereal: {
    primary: 'rgba(14, 165, 233, 0.7)',
    secondary: 'rgba(139, 92, 246, 0.7)',
    background: 'rgba(15, 23, 42, 0.4)'
  },
  quantum: {
    primary: 'rgba(234, 179, 8, 0.7)',
    secondary: 'rgba(168, 85, 247, 0.7)',
    background: 'rgba(17, 24, 39, 0.5)'
  }
};

const sizeClasses: Record<CubeSize, string> = {
  sm: 'w-40 h-40',
  md: 'w-56 h-56',
  lg: 'w-72 h-72',
  xl: 'w-96 h-96',
  full: 'w-full h-full'
};

const MetatronsCube: React.FC<MetatronsCubeProps> = ({
  className,
  size = 'md',
  variant = 'default',
  nodes = [],
  connections = [],
  activeNodeId,
  onNodeClick,
  withAnimation = true,
  intensity = 1
}) => {
  const { config } = usePerfConfig();
  
  // Determine if we should use simpler rendering based on device capability
  const shouldUseSimpleRendering = config.deviceCapability === 'low';
  
  // Calculate intensity adjustment based on device capability
  const adjustedIntensity = shouldUseSimpleRendering ? intensity * 0.7 : intensity;
  
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        sizeClasses[size],
        className
      )}
      data-variant={variant}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={withAnimation ? { scale: 0.9, opacity: 0 } : false}
        animate={withAnimation ? { scale: 1, opacity: 1 } : false}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <CubeRenderer
          nodes={nodes}
          connections={connections}
          activeNodeId={activeNodeId}
          onNodeClick={onNodeClick}
          variant={variant}
          size={size}
          withAnimation={withAnimation && !shouldUseSimpleRendering}
          intensity={adjustedIntensity}
        />
      </motion.div>
    </div>
  );
};

export default MetatronsCube;
