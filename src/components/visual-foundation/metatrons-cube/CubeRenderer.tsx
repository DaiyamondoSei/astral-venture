
import React, { memo } from 'react';
import { CubeTheme, MetatronsNode, MetatronsConnection, CubeSize } from './types';
import CubeLines from './CubeLines';
import CubeNode from './CubeNode';
import { usePerfConfig } from '@/hooks/usePerfConfig';

interface CubeRendererProps {
  nodes: MetatronsNode[];
  connections: MetatronsConnection[];
  activeNodeId?: string;
  onNodeClick?: (nodeId: string) => void;
  size: CubeSize;
  variant: CubeTheme;
  intensity?: number;
  withAnimation?: boolean;
  className?: string;
}

const CubeRenderer: React.FC<CubeRendererProps> = ({ 
  nodes, 
  connections, 
  activeNodeId, 
  onNodeClick,
  size,
  variant,
  intensity = 1,
  withAnimation = true,
  className
}) => {
  const { config } = usePerfConfig();
  const isLowPerformance = config.deviceCapability === 'low';
  
  // For low-performance devices, reduce the number of nodes and connections
  const renderNodes = isLowPerformance 
    ? nodes.slice(0, Math.ceil(nodes.length * 0.6)) 
    : nodes;
    
  const renderConnections = isLowPerformance 
    ? connections.slice(0, Math.ceil(connections.length * 0.4)) 
    : connections;
  
  // Disable animations for low-performance devices
  const enableAnimations = withAnimation && !isLowPerformance;
  
  return (
    <div className={className}>
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <CubeLines 
          connections={renderConnections} 
          variant={variant} 
          activeNodeId={activeNodeId}
          withAnimation={enableAnimations}
          intensity={intensity}
        />
        
        {renderNodes.map(node => (
          <CubeNode
            key={node.id}
            node={node}
            isActive={node.id === activeNodeId}
            onClick={() => onNodeClick && onNodeClick(node.id)}
            variant={variant}
            size={size}
            withAnimation={enableAnimations}
            intensity={intensity}
          />
        ))}
      </svg>
    </div>
  );
};

export default memo(CubeRenderer);
