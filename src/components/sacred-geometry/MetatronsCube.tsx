
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
import { motion } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
  const [rotation, setRotation] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
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

    // Add gentle rotation animation
    const rotationInterval = setInterval(() => {
      if (!isRotating) {
        setRotation(prev => (prev + 0.2) % 360);
      }
    }, 100);

    return () => clearInterval(rotationInterval);
  }, [isRotating]);

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

  // Handle manual rotation
  const handleTouchStart = () => {
    setIsRotating(true);
  };

  const handleTouchEnd = () => {
    setIsRotating(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRotating && e.touches.length === 1) {
      const touch = e.touches[0];
      const container = e.currentTarget.getBoundingClientRect();
      const centerX = container.left + container.width / 2;
      const centerY = container.top + container.height / 2;
      
      // Calculate angle from center to touch point
      const angleRadians = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
      const angleDegrees = (angleRadians * 180 / Math.PI + 360) % 360;
      
      setRotation(angleDegrees);
    }
  };

  // Define the connection lines between nodes
  const connectionLines = useMemo(() => {
    // Generate combinations of nodes
    const lines: { from: number; to: number }[] = [];
    
    // Simple connection pattern: connect adjacent nodes
    for (let i = 0; i < geometryNodes.length; i++) {
      for (let j = i + 1; j < geometryNodes.length; j++) {
        // Connect based on some condition, e.g., every node connects to 3 others
        // This is a simplified example, you may want a more specific connection pattern
        if (j === i + 1 || j === (i + 3) % geometryNodes.length || j === (i + 5) % geometryNodes.length) {
          lines.push({ from: i, to: j });
        }
      }
    }
    
    return lines;
  }, [geometryNodes]);

  return (
    <div 
      className={cn("relative w-full aspect-square max-w-3xl mx-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
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
      
      {/* Rotating Cube Container */}
      <motion.div 
        className="absolute inset-0 z-10"
        style={{ rotate: `${rotation}deg` }}
        transition={{ type: "spring", damping: 20 }}
      >
        {/* Connection Lines */}
        <svg className="absolute inset-0 z-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {connectionLines.map((line, index) => {
            const fromNode = geometryNodes[line.from];
            const toNode = geometryNodes[line.to];
            
            // Extract coordinates from position classes
            const fromMatch = fromNode.position.match(/top-\[(\d+)%\]|left-\[(\d+)%\]|right-\[(\d+)%\]|bottom-\[(\d+)%\]/g);
            const toMatch = toNode.position.match(/top-\[(\d+)%\]|left-\[(\d+)%\]|right-\[(\d+)%\]|bottom-\[(\d+)%\]/g);
            
            // Default center position
            let fromX = 50;
            let fromY = 50;
            let toX = 50;
            let toY = 50;
            
            // Parse position values (simplified example)
            if (fromNode.position.includes('top-[')) {
              const match = fromNode.position.match(/top-\[(\d+)%\]/);
              if (match) fromY = parseInt(match[1]);
            }
            if (fromNode.position.includes('left-[')) {
              const match = fromNode.position.match(/left-\[(\d+)%\]/);
              if (match) fromX = parseInt(match[1]);
            }
            if (fromNode.position.includes('right-[')) {
              const match = fromNode.position.match(/right-\[(\d+)%\]/);
              if (match) fromX = 100 - parseInt(match[1]);
            }
            if (fromNode.position.includes('bottom-[')) {
              const match = fromNode.position.match(/bottom-\[(\d+)%\]/);
              if (match) fromY = 100 - parseInt(match[1]);
            }
            
            if (toNode.position.includes('top-[')) {
              const match = toNode.position.match(/top-\[(\d+)%\]/);
              if (match) toY = parseInt(match[1]);
            }
            if (toNode.position.includes('left-[')) {
              const match = toNode.position.match(/left-\[(\d+)%\]/);
              if (match) toX = parseInt(match[1]);
            }
            if (toNode.position.includes('right-[')) {
              const match = toNode.position.match(/right-\[(\d+)%\]/);
              if (match) toX = 100 - parseInt(match[1]);
            }
            if (toNode.position.includes('bottom-[')) {
              const match = toNode.position.match(/bottom-\[(\d+)%\]/);
              if (match) toY = 100 - parseInt(match[1]);
            }
            
            // Get node status for line styling
            const fromStatus = getNodeStatus(line.from);
            const toStatus = getNodeStatus(line.to);
            const bothUnlocked = fromStatus.unlocked && toStatus.unlocked;
            
            return (
              <line
                key={`line-${index}`}
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke={bothUnlocked ? "url(#lineGradient)" : "rgba(255,255,255,0.1)"}
                strokeWidth={bothUnlocked ? "0.3" : "0.15"}
                strokeOpacity={bothUnlocked ? 0.7 : 0.3}
              />
            );
          })}
          
          {/* Gradient definition for lines */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.7)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.7)" />
            </linearGradient>
          </defs>
        </svg>
        
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
      </motion.div>
      
      {/* Central Node - Not affected by rotation */}
      <CentralNode 
        energyPoints={energyPoints} 
        onSelectNode={onSelectNode} 
      />
      
      {/* Consciousness level indicator */}
      <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/70">
        Level {consciousnessLevel.toFixed(1)}
      </div>
    </div>
  );
};

export default MetatronsCube;
