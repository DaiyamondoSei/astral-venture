
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { DownloadableMaterial } from './types/geometry';
import GeometryNodeComponent from './components/GeometryNode';
import MetatronsBackground from './components/MetatronsBackground';
import CentralNode from './components/CentralNode';
import createGeometryNodes from './data/nodeData';
import useNodeStatus from './hooks/useNodeStatus';

interface MetatronsCubeProps {
  userId?: string;
  className?: string;
  onSelectNode?: (nodeId: string, downloadables?: DownloadableMaterial[]) => void;
  energyPoints: number;
}

const MetatronsCube: React.FC<MetatronsCubeProps> = ({ 
  userId, 
  className, 
  onSelectNode,
  energyPoints = 0
}) => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get geometry nodes
  const geometryNodes = createGeometryNodes(onSelectNode);
  
  // Get node status hook
  const { getNodeStatus } = useNodeStatus(energyPoints, geometryNodes);

  const handleNodeClick = (node: any) => {
    const nodeStatus = getNodeStatus(geometryNodes.indexOf(node));
    
    if (!nodeStatus.unlocked) {
      // Show locked message
      return;
    }
    
    setActiveNode(node.id);
    
    if (node.action) {
      node.action();
    } else if (node.route) {
      navigate(node.route);
    }
  };

  return (
    <div className={cn("relative w-full aspect-square max-w-3xl mx-auto", className)}>
      {/* Metatron's Cube Background */}
      <MetatronsBackground />
      
      {/* Geometry Nodes */}
      {geometryNodes.map((node, index) => {
        const nodeStatus = getNodeStatus(index);
        
        return (
          <GeometryNodeComponent
            key={node.id}
            node={node}
            index={index}
            nodeStatus={nodeStatus}
            activeNode={activeNode}
            hoverNode={hoverNode}
            onNodeClick={handleNodeClick}
            onNodeHover={setHoverNode}
          />
        );
      })}
      
      {/* Central Node */}
      <CentralNode 
        energyPoints={energyPoints} 
        onSelectNode={onSelectNode} 
      />
    </div>
  );
};

export default MetatronsCube;
