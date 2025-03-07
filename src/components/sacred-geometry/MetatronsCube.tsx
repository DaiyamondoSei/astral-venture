
import React, { useState, useEffect, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { DownloadableMaterial } from './types/geometry';
import GeometryNodeComponent from './components/GeometryNode';
import MetatronsBackground from './components/MetatronsBackground';
import CentralNode from './components/CentralNode';
import createGeometryNodes from './data/nodeData';
import useNodeStatus from './hooks/useNodeStatus';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface MetatronsCubeProps {
  userId?: string;
  className?: string;
  onSelectNode?: (nodeId: string, downloadables?: DownloadableMaterial[]) => void;
  energyPoints: number;
  onBack?: () => void;
  consciousnessLevel?: number;
}

const MetatronsCube: React.FC<MetatronsCubeProps> = ({ 
  userId, 
  className, 
  onSelectNode,
  energyPoints = 0,
  onBack,
  consciousnessLevel = 1
}) => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  // Get geometry nodes
  const geometryNodes = useMemo(() => createGeometryNodes(onSelectNode), [onSelectNode]);
  
  // Get node status hook
  const { getNodeStatus } = useNodeStatus(energyPoints, geometryNodes);

  useEffect(() => {
    // Show help tooltip on first visit
    if (typeof window !== 'undefined') {
      const hasSeenHelp = localStorage.getItem('metatrons-cube-help-seen');
      if (!hasSeenHelp) {
        setShowHelp(true);
        // Set with a delay so user sees it
        setTimeout(() => {
          localStorage.setItem('metatrons-cube-help-seen', 'true');
        }, 5000);
      }
    }
  }, []);

  const handleNodeClick = (node: any) => {
    const nodeStatus = getNodeStatus(geometryNodes.indexOf(node));
    
    if (!nodeStatus.unlocked) {
      // Show locked message
      toast({
        title: "Node Locked",
        description: `You need ${nodeStatus.threshold} energy points to unlock this aspect of consciousness.`,
        variant: "default"
      });
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
      {/* Help tooltip */}
      {showHelp && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm p-3 rounded-lg z-30 max-w-xs text-center">
          <p>Navigate through different aspects of consciousness by selecting the sacred geometry nodes.</p>
          <button 
            className="mt-2 text-xs text-quantum-400 hover:text-quantum-300"
            onClick={() => setShowHelp(false)}
          >
            Got it
          </button>
        </div>
      )}
      
      {/* Metatron's Cube Background */}
      <div className="absolute inset-0 z-0">
        <MetatronsBackground 
          animated={true} 
          intensity="medium" 
          consciousnessLevel={consciousnessLevel}
        />
      </div>
      
      {/* Geometry Nodes - Precisely positioned at intersection points */}
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
