
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DownloadableMaterial } from './types/geometry';
import GeometryNodeComponent from './components/GeometryNode';
import MetatronsBackground from './components/MetatronsBackground';
import CentralNode from './components/CentralNode';
import createGeometryNodes from './data/nodeData';
import useNodeStatus from './hooks/useNodeStatus';
import { Button } from '@/components/ui/button';

interface MetatronsCubeProps {
  userId?: string;
  className?: string;
  onSelectNode?: (nodeId: string, downloadables?: DownloadableMaterial[]) => void;
  energyPoints: number;
  onBack?: () => void;
}

const MetatronsCube: React.FC<MetatronsCubeProps> = ({ 
  userId, 
  className, 
  onSelectNode,
  energyPoints = 0,
  onBack
}) => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  // Get geometry nodes
  const geometryNodes = createGeometryNodes(onSelectNode);
  
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
      {/* Back Button - Add navigation to go back */}
      {onBack && (
        <Button 
          variant="ghost" 
          size="sm"
          className="absolute top-0 left-0 z-30 text-white/80 hover:text-white"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      )}

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
      <MetatronsBackground />
      
      {/* Geometry Nodes - Precisely positioned at intersection points */}
      {geometryNodes.map((node, index) => {
        const nodeStatus = getNodeStatus(index);
        
        // Get exact positioning class based on node position
        const positionClass = getNodePositionClass(node.id);
        
        return (
          <GeometryNodeComponent
            key={node.id}
            node={{
              ...node,
              position: positionClass
            }}
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

// Helper function to get precise node positioning
const getNodePositionClass = (nodeId: string): string => {
  // Map each node ID to the correct position on the Metatron's Cube
  const positionMap: Record<string, string> = {
    'meditation': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', // center
    'chakras': 'absolute top-[5%] left-1/2 -translate-x-1/2', // top
    'dreams': 'absolute top-[14.6%] right-[14.6%] translate-x-1/3 -translate-y-1/3', // top-right inner
    'energy': 'absolute bottom-[14.6%] right-[14.6%] translate-x-1/3 translate-y-1/3', // bottom-right inner
    'reflection': 'absolute bottom-[5%] left-1/2 -translate-x-1/2', // bottom
    'healing': 'absolute bottom-[14.6%] left-[14.6%] -translate-x-1/3 translate-y-1/3', // bottom-left inner
    'wisdom': 'absolute top-[14.6%] left-[14.6%] -translate-x-1/3 -translate-y-1/3', // top-left inner
    'astral': 'absolute top-[15%] left-[15%]', // top-left inner
    'sacred': 'absolute top-[15%] right-[15%]', // top-right inner
    'elements': 'absolute bottom-[15%] right-[15%]', // bottom-right inner
    'consciousness': 'absolute bottom-[15%] left-[15%]', // bottom-left inner
    'nature': 'absolute right-[5%] top-1/2 translate-y-[-50%]', // right
    'guidance': 'absolute left-[5%] top-1/2 translate-y-[-50%]' // left
  };
  
  return positionMap[nodeId] || 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
};

export default MetatronsCube;
