
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import MetatronsCube from './metatrons-cube/MetatronsCube';
import { MetatronsNode, MetatronsConnection, CubeSize, CubeTheme } from './metatrons-cube/types';
import { usePerfConfig } from '@/hooks/usePerfConfig';

interface VisualSystemProps {
  className?: string;
  variant?: 'simple' | 'complex' | 'interactive';
  theme?: CubeTheme;
  size?: CubeSize;
  onNodeActivated?: (nodeId: string) => void;
  activeNode?: string;
  animationLevel?: number;
}

/**
 * VisualSystem renders a sacred geometry visualization
 * with various complexities based on device capabilities
 */
const VisualSystem: React.FC<VisualSystemProps> = ({
  className,
  variant = 'simple',
  theme = 'default',
  size = 'md',
  onNodeActivated,
  activeNode,
  animationLevel = 1
}) => {
  const { config } = usePerfConfig();
  
  // Generate nodes based on variant
  const nodes: MetatronsNode[] = useMemo(() => {
    const baseNodes: MetatronsNode[] = [
      // Center node
      { id: 'center', x: 200, y: 200, size: 14 },
      
      // Inner hexagon
      { id: 'inner1', x: 200, y: 150, size: 12 },
      { id: 'inner2', x: 243, y: 175, size: 12 },
      { id: 'inner3', x: 243, y: 225, size: 12 },
      { id: 'inner4', x: 200, y: 250, size: 12 },
      { id: 'inner5', x: 157, y: 225, size: 12 },
      { id: 'inner6', x: 157, y: 175, size: 12 },
    ];
    
    // Only add outer nodes for complex/interactive variants
    const outerNodes: MetatronsNode[] = variant !== 'simple' ? [
      // Outer nodes
      { id: 'outer1', x: 200, y: 100, size: 10 },
      { id: 'outer2', x: 286, y: 150, size: 10 },
      { id: 'outer3', x: 286, y: 250, size: 10 },
      { id: 'outer4', x: 200, y: 300, size: 10 },
      { id: 'outer5', x: 114, y: 250, size: 10 },
      { id: 'outer6', x: 114, y: 150, size: 10 },
    ] : [];
    
    // Add labels for interactive variant
    if (variant === 'interactive') {
      return [
        ...baseNodes.map(node => ({
          ...node,
          active: node.id === activeNode,
          pulsing: node.id === activeNode
        })),
        ...outerNodes.map(node => ({
          ...node,
          active: node.id === activeNode,
          pulsing: node.id === activeNode,
          label: getLabelForNode(node.id),
          tooltip: getTooltipForNode(node.id)
        })),
      ];
    }
    
    return [...baseNodes, ...outerNodes];
  }, [variant, activeNode]);
  
  // Generate connections based on variant
  const connections: MetatronsConnection[] = useMemo(() => {
    const baseConnections: MetatronsConnection[] = [
      // Connect center to inner hexagon
      { from: 'center', to: 'inner1' },
      { from: 'center', to: 'inner2' },
      { from: 'center', to: 'inner3' },
      { from: 'center', to: 'inner4' },
      { from: 'center', to: 'inner5' },
      { from: 'center', to: 'inner6' },
      
      // Connect inner hexagon
      { from: 'inner1', to: 'inner2' },
      { from: 'inner2', to: 'inner3' },
      { from: 'inner3', to: 'inner4' },
      { from: 'inner4', to: 'inner5' },
      { from: 'inner5', to: 'inner6' },
      { from: 'inner6', to: 'inner1' },
    ];
    
    // Only add outer connections for complex/interactive variants
    if (variant === 'simple') {
      return baseConnections;
    }
    
    const outerConnections: MetatronsConnection[] = [
      // Connect inner to outer
      { from: 'inner1', to: 'outer1' },
      { from: 'inner2', to: 'outer2' },
      { from: 'inner3', to: 'outer3' },
      { from: 'inner4', to: 'outer4' },
      { from: 'inner5', to: 'outer5' },
      { from: 'inner6', to: 'outer6' },
      
      // Connect outer hexagon
      { from: 'outer1', to: 'outer2' },
      { from: 'outer2', to: 'outer3' },
      { from: 'outer3', to: 'outer4' },
      { from: 'outer4', to: 'outer5' },
      { from: 'outer5', to: 'outer6' },
      { from: 'outer6', to: 'outer1' },
    ];
    
    // Add active state for interactive variant
    if (variant === 'interactive') {
      return [
        ...baseConnections.map(conn => ({
          ...conn,
          active: conn.from === activeNode || conn.to === activeNode
        })),
        ...outerConnections.map(conn => ({
          ...conn,
          active: conn.from === activeNode || conn.to === activeNode
        }))
      ];
    }
    
    return [...baseConnections, ...outerConnections];
  }, [variant, activeNode]);
  
  // Handle node click for interactive variant
  const handleNodeClick = (nodeId: string) => {
    if (variant === 'interactive' && onNodeActivated) {
      onNodeActivated(nodeId);
    }
  };
  
  // Adjust animation level based on device capability
  const effectiveAnimationLevel = config.deviceCapability === 'low' 
    ? Math.min(animationLevel, 1) 
    : animationLevel;

  return (
    <div className={cn("relative", className)}>
      <MetatronsCube
        nodes={nodes}
        connections={connections}
        variant={theme}
        size={size}
        activeNodeId={activeNode}
        onNodeClick={handleNodeClick}
        withAnimation={effectiveAnimationLevel > 0}
        intensity={effectiveAnimationLevel}
      />
    </div>
  );
};

// Helper function to get labels for nodes
function getLabelForNode(nodeId: string): string {
  switch (nodeId) {
    case 'outer1': return 'Meditation';
    case 'outer2': return 'Wisdom';
    case 'outer3': return 'Energy';
    case 'outer4': return 'Practice';
    case 'outer5': return 'Chakras';
    case 'outer6': return 'Insights';
    default: return '';
  }
}

// Helper function to get tooltips for nodes
function getTooltipForNode(nodeId: string): string {
  switch (nodeId) {
    case 'outer1': return 'Access guided meditations';
    case 'outer2': return 'Explore spiritual teachings';
    case 'outer3': return 'View your energy levels';
    case 'outer4': return 'Daily spiritual practices';
    case 'outer5': return 'Chakra balancing tools';
    case 'outer6': return 'Personal insights and reflections';
    default: return '';
  }
}

export default VisualSystem;
