
import React, { useMemo, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import MetatronsCube from './metatrons-cube/MetatronsCube';
import { MetatronsNode, MetatronsConnection, CubeSize, CubeTheme } from './metatrons-cube/types';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { getParticleCount, shouldEnableFeature } from '@/utils/performanceUtils';

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
  const { config, effectiveQualityLevel } = usePerfConfig();
  
  // Track last interaction time for optimization
  const [lastInteractionTime, setLastInteractionTime] = useState(0);
  
  // Generate nodes based on variant and quality level
  const nodes: MetatronsNode[] = useMemo(() => {
    // Get particle count based on quality level - this determines how many nodes to show
    const particleLimit = getParticleCount(effectiveQualityLevel, 'core');
    
    // Base nodes - always present
    const baseNodes: MetatronsNode[] = [
      // Center node
      { id: 'center', x: 200, y: 200, size: 14, state: 'active' },
      
      // Inner hexagon - these are key nodes in all variants
      { id: 'inner1', x: 200, y: 150, size: 12 },
      { id: 'inner2', x: 243, y: 175, size: 12 },
      { id: 'inner3', x: 243, y: 225, size: 12 },
      { id: 'inner4', x: 200, y: 250, size: 12 },
      { id: 'inner5', x: 157, y: 225, size: 12 },
      { id: 'inner6', x: 157, y: 175, size: 12 },
    ];
    
    // Only add outer nodes for complex/interactive variants if quality level permits
    let outerNodes: MetatronsNode[] = [];
    
    if (variant !== 'simple' && particleLimit >= 12) {
      outerNodes = [
        // Outer nodes
        { id: 'outer1', x: 200, y: 100, size: 10 },
        { id: 'outer2', x: 286, y: 150, size: 10 },
        { id: 'outer3', x: 286, y: 250, size: 10 },
        { id: 'outer4', x: 200, y: 300, size: 10 },
        { id: 'outer5', x: 114, y: 250, size: 10 },
        { id: 'outer6', x: 114, y: 150, size: 10 },
      ];
    }
    
    // Add tertiary nodes for high quality levels in complex variants
    let tertiaryNodes: MetatronsNode[] = [];
    
    if (variant === 'complex' && effectiveQualityLevel >= 4 && particleLimit >= 24) {
      tertiaryNodes = [
        // Additional outer connection nodes for high quality
        { id: 'tertiary1', x: 243, y: 125, size: 8 },
        { id: 'tertiary2', x: 286, y: 200, size: 8 },
        { id: 'tertiary3', x: 243, y: 275, size: 8 },
        { id: 'tertiary4', x: 157, y: 275, size: 8 },
        { id: 'tertiary5', x: 114, y: 200, size: 8 },
        { id: 'tertiary6', x: 157, y: 125, size: 8 },
      ];
    }
    
    // Add labels and enhance nodes for interactive variant
    if (variant === 'interactive') {
      const enhancedBaseNodes = baseNodes.map(node => ({
        ...node,
        active: node.id === activeNode,
        pulsing: node.id === activeNode
      }));
      
      const enhancedOuterNodes = outerNodes.map(node => ({
        ...node,
        active: node.id === activeNode,
        pulsing: node.id === activeNode,
        label: getLabelForNode(node.id),
        tooltip: getTooltipForNode(node.id)
      }));
      
      const enhancedTertiaryNodes = tertiaryNodes.map(node => ({
        ...node,
        active: node.id === activeNode,
        pulsing: node.id === activeNode
      }));
      
      return [...enhancedBaseNodes, ...enhancedOuterNodes, ...enhancedTertiaryNodes];
    }
    
    return [...baseNodes, ...outerNodes, ...tertiaryNodes];
  }, [variant, activeNode, effectiveQualityLevel]);
  
  // Generate connections based on variant, quality level, and nodes
  const connections: MetatronsConnection[] = useMemo(() => {
    // Get available node IDs for creating valid connections
    const nodeIds = nodes.map(node => node.id);
    
    // Helper to check if a node exists before creating connection
    const hasNode = (id: string) => nodeIds.includes(id);
    
    // Base connections - always present
    const baseConnections: MetatronsConnection[] = [
      // Connect center to inner hexagon
      ...(hasNode('center') && hasNode('inner1') ? [{ from: 'center', to: 'inner1' }] : []),
      ...(hasNode('center') && hasNode('inner2') ? [{ from: 'center', to: 'inner2' }] : []),
      ...(hasNode('center') && hasNode('inner3') ? [{ from: 'center', to: 'inner3' }] : []),
      ...(hasNode('center') && hasNode('inner4') ? [{ from: 'center', to: 'inner4' }] : []),
      ...(hasNode('center') && hasNode('inner5') ? [{ from: 'center', to: 'inner5' }] : []),
      ...(hasNode('center') && hasNode('inner6') ? [{ from: 'center', to: 'inner6' }] : []),
      
      // Connect inner hexagon
      ...(hasNode('inner1') && hasNode('inner2') ? [{ from: 'inner1', to: 'inner2' }] : []),
      ...(hasNode('inner2') && hasNode('inner3') ? [{ from: 'inner2', to: 'inner3' }] : []),
      ...(hasNode('inner3') && hasNode('inner4') ? [{ from: 'inner3', to: 'inner4' }] : []),
      ...(hasNode('inner4') && hasNode('inner5') ? [{ from: 'inner4', to: 'inner5' }] : []),
      ...(hasNode('inner5') && hasNode('inner6') ? [{ from: 'inner5', to: 'inner6' }] : []),
      ...(hasNode('inner6') && hasNode('inner1') ? [{ from: 'inner6', to: 'inner1' }] : []),
    ];
    
    // Only add outer connections if the nodes exist
    const outerConnections: MetatronsConnection[] = [
      // Connect inner to outer
      ...(hasNode('inner1') && hasNode('outer1') ? [{ from: 'inner1', to: 'outer1' }] : []),
      ...(hasNode('inner2') && hasNode('outer2') ? [{ from: 'inner2', to: 'outer2' }] : []),
      ...(hasNode('inner3') && hasNode('outer3') ? [{ from: 'inner3', to: 'outer3' }] : []),
      ...(hasNode('inner4') && hasNode('outer4') ? [{ from: 'inner4', to: 'outer4' }] : []),
      ...(hasNode('inner5') && hasNode('outer5') ? [{ from: 'inner5', to: 'outer5' }] : []),
      ...(hasNode('inner6') && hasNode('outer6') ? [{ from: 'inner6', to: 'outer6' }] : []),
      
      // Connect outer hexagon
      ...(hasNode('outer1') && hasNode('outer2') ? [{ from: 'outer1', to: 'outer2' }] : []),
      ...(hasNode('outer2') && hasNode('outer3') ? [{ from: 'outer2', to: 'outer3' }] : []),
      ...(hasNode('outer3') && hasNode('outer4') ? [{ from: 'outer3', to: 'outer4' }] : []),
      ...(hasNode('outer4') && hasNode('outer5') ? [{ from: 'outer4', to: 'outer5' }] : []),
      ...(hasNode('outer5') && hasNode('outer6') ? [{ from: 'outer5', to: 'outer6' }] : []),
      ...(hasNode('outer6') && hasNode('outer1') ? [{ from: 'outer6', to: 'outer1' }] : []),
    ];
    
    // Add tertiary connections for high quality levels
    const tertiaryConnections: MetatronsConnection[] = [
      // Connect inner to tertiary
      ...(hasNode('inner1') && hasNode('tertiary1') ? [{ from: 'inner1', to: 'tertiary1' }] : []),
      ...(hasNode('inner2') && hasNode('tertiary2') ? [{ from: 'inner2', to: 'tertiary2' }] : []),
      ...(hasNode('inner3') && hasNode('tertiary3') ? [{ from: 'inner3', to: 'tertiary3' }] : []),
      ...(hasNode('inner4') && hasNode('tertiary4') ? [{ from: 'inner4', to: 'tertiary4' }] : []),
      ...(hasNode('inner5') && hasNode('tertiary5') ? [{ from: 'inner5', to: 'tertiary5' }] : []),
      ...(hasNode('inner6') && hasNode('tertiary6') ? [{ from: 'inner6', to: 'tertiary6' }] : []),
      
      // Connect tertiary nodes
      ...(hasNode('tertiary1') && hasNode('tertiary2') ? [{ from: 'tertiary1', to: 'tertiary2' }] : []),
      ...(hasNode('tertiary2') && hasNode('tertiary3') ? [{ from: 'tertiary2', to: 'tertiary3' }] : []),
      ...(hasNode('tertiary3') && hasNode('tertiary4') ? [{ from: 'tertiary3', to: 'tertiary4' }] : []),
      ...(hasNode('tertiary4') && hasNode('tertiary5') ? [{ from: 'tertiary4', to: 'tertiary5' }] : []),
      ...(hasNode('tertiary5') && hasNode('tertiary6') ? [{ from: 'tertiary5', to: 'tertiary6' }] : []),
      ...(hasNode('tertiary6') && hasNode('tertiary1') ? [{ from: 'tertiary6', to: 'tertiary1' }] : []),
      
      // Connect outer to tertiary
      ...(hasNode('outer1') && hasNode('tertiary1') ? [{ from: 'outer1', to: 'tertiary1' }] : []),
      ...(hasNode('outer2') && hasNode('tertiary2') ? [{ from: 'outer2', to: 'tertiary2' }] : []),
      ...(hasNode('outer3') && hasNode('tertiary3') ? [{ from: 'outer3', to: 'tertiary3' }] : []),
      ...(hasNode('outer4') && hasNode('tertiary4') ? [{ from: 'outer4', to: 'tertiary4' }] : []),
      ...(hasNode('outer5') && hasNode('tertiary5') ? [{ from: 'outer5', to: 'tertiary5' }] : []),
      ...(hasNode('outer6') && hasNode('tertiary6') ? [{ from: 'outer6', to: 'tertiary6' }] : []),
    ];
    
    // Combine all connections based on quality level
    let allConnections = [...baseConnections];
    
    if (variant !== 'simple') {
      allConnections = [...allConnections, ...outerConnections];
    }
    
    if (variant === 'complex' && effectiveQualityLevel >= 4) {
      allConnections = [...allConnections, ...tertiaryConnections];
    }
    
    // Add active state and animation for interactive variant
    if (variant === 'interactive') {
      return allConnections.map(conn => ({
        ...conn,
        active: conn.from === activeNode || conn.to === activeNode,
        animated: conn.from === activeNode || conn.to === activeNode
      }));
    }
    
    return allConnections;
  }, [variant, activeNode, effectiveQualityLevel, nodes]);
  
  // Handle node click for interactive variant
  const handleNodeClick = useCallback((nodeId: string) => {
    if (variant === 'interactive' && onNodeActivated) {
      onNodeActivated(nodeId);
      setLastInteractionTime(Date.now());
    }
  }, [variant, onNodeActivated]);
  
  // Adjust animation level based on device capability and interaction recency
  const effectiveAnimationLevel = useMemo(() => {
    // If animations are disabled, return 0
    if (config.disableAnimations) return 0;
    
    // Reduce animation based on device capability
    let level = config.deviceCapability === 'low' 
      ? Math.min(animationLevel, 1) 
      : animationLevel;
      
    // If adaptive rendering is enabled, adjust based on time since last interaction
    if (config.enableAdaptiveRendering && lastInteractionTime > 0) {
      const timeSinceInteraction = Date.now() - lastInteractionTime;
      
      // Reduce animation level after 10 seconds of inactivity
      if (timeSinceInteraction > 10000) {
        level = Math.max(0, level - 1);
      }
    }
    
    return level;
  }, [config.disableAnimations, config.deviceCapability, config.enableAdaptiveRendering, 
      animationLevel, lastInteractionTime]);

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
        qualityLevel={effectiveQualityLevel}
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
