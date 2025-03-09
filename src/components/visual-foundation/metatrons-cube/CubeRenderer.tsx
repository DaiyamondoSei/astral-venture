
import React, { useMemo } from 'react';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { CubeRendererProps, MetatronsNode, GlowIntensity } from './types';
import CubeLines from './CubeLines';
import CubeNode from './CubeNode';

/**
 * CubeRenderer handles the SVG rendering of nodes and connections
 * with performance optimizations
 */
const CubeRenderer: React.FC<CubeRendererProps> = ({
  nodes,
  connections,
  activeNodeId,
  onNodeClick,
  variant = 'default',
  withAnimation = false,
  intensity = 5
}) => {
  const { config } = usePerfConfig();
  
  // Theme colors
  const themeColors = {
    default: {
      primary: 'rgba(147, 51, 234, 0.7)',
      secondary: 'rgba(59, 130, 246, 0.7)',
    },
    cosmic: {
      primary: 'rgba(236, 72, 153, 0.7)',
      secondary: 'rgba(124, 58, 237, 0.7)',
    },
    ethereal: {
      primary: 'rgba(14, 165, 233, 0.7)',
      secondary: 'rgba(139, 92, 246, 0.7)',
    },
    quantum: {
      primary: 'rgba(234, 179, 8, 0.7)',
      secondary: 'rgba(168, 85, 247, 0.7)',
    }
  };
  
  // Calculate theme-related styles
  const theme = themeColors[variant];
  const adjustedIntensity = config.deviceCapability === 'low' ? intensity * 0.7 : intensity;
  
  const primaryColor = useMemo(() => {
    const opacity = Math.min(0.85, 0.7 * adjustedIntensity);
    return theme.primary.replace(/[^,]+(?=\))/, String(opacity));
  }, [theme.primary, adjustedIntensity]);
  
  const secondaryColor = useMemo(() => {
    const opacity = Math.min(0.85, 0.7 * adjustedIntensity);
    return theme.secondary.replace(/[^,]+(?=\))/, String(opacity));
  }, [theme.secondary, adjustedIntensity]);
  
  // Convert nodes array to a lookup object for faster access
  const nodePositions = useMemo(() => {
    return nodes.reduce((acc, node) => {
      acc[node.id] = { x: node.x, y: node.y };
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
  }, [nodes]);
  
  // Reduce visual complexity for low-end devices
  const displayedConnections = useMemo(() => {
    if (config.deviceCapability === 'low') {
      // For low-performance devices, only show a subset of connections
      return connections.filter((_, index) => index % 2 === 0);
    }
    return connections;
  }, [connections, config.deviceCapability]);
  
  const glowIntensity: GlowIntensity = config.deviceCapability === 'low' ? 'low' : 'medium';
  const isSimplified = config.deviceCapability === 'low';

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 400 400" 
      className="w-full h-full"
    >
      {/* Draw connection lines */}
      <CubeLines
        connections={displayedConnections}
        nodes={nodePositions}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        activeNodeId={activeNodeId}
        glowIntensity={glowIntensity}
        isSimplified={isSimplified}
      />
      
      {/* Draw nodes */}
      {nodes.map(node => (
        <CubeNode
          key={node.id}
          node={node}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          isActive={activeNodeId === node.id}
          onClick={onNodeClick ? onNodeClick : () => {}}
          glowIntensity={glowIntensity}
          isSimplified={isSimplified}
        />
      ))}
    </svg>
  );
};

export default CubeRenderer;
