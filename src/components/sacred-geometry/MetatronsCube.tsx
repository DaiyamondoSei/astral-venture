
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import GlowEffect from '@/components/GlowEffect';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, Star, Flower, Sun, Moon, Sparkles, 
  Brain, Heart, Eye, Zap, Flame, Triangle, CircleDot 
} from 'lucide-react';

interface GeometryNode {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  position: string;
  route?: string;
  action?: () => void;
}

interface MetatronsCubeProps {
  userId?: string;
  className?: string;
  onSelectNode?: (nodeId: string) => void;
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

  // Define the sacred geometry nodes
  const geometryNodes: GeometryNode[] = [
    {
      id: 'meditation',
      name: 'Meditation',
      icon: <Brain size={24} />,
      description: 'Center your consciousness and access higher states of being',
      color: 'from-purple-400 to-purple-600',
      position: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      action: () => onSelectNode?.('meditation')
    },
    {
      id: 'chakras',
      name: 'Chakras',
      icon: <Sun size={24} />,
      description: 'Balance your energy centers for optimal flow',
      color: 'from-orange-400 to-red-500',
      position: 'top-0 left-1/2 -translate-x-1/2',
      action: () => onSelectNode?.('chakras')
    },
    {
      id: 'dreams',
      name: 'Dreams',
      icon: <Moon size={24} />,
      description: 'Explore your subconscious through dream analysis',
      color: 'from-indigo-400 to-indigo-600',
      position: 'top-1/4 right-0 translate-x-1/4',
      action: () => onSelectNode?.('dreams')
    },
    {
      id: 'energy',
      name: 'Energy Work',
      icon: <Zap size={24} />,
      description: 'Harness and direct your subtle energy field',
      color: 'from-cyan-400 to-blue-500',
      position: 'bottom-1/4 right-0 translate-x-1/4',
      action: () => onSelectNode?.('energy')
    },
    {
      id: 'reflection',
      name: 'Reflection',
      icon: <Eye size={24} />,
      description: 'Deepen awareness through conscious self-reflection',
      color: 'from-emerald-400 to-teal-600',
      position: 'bottom-0 left-1/2 -translate-x-1/2',
      action: () => onSelectNode?.('reflection')
    },
    {
      id: 'healing',
      name: 'Healing',
      icon: <Heart size={24} />,
      description: 'Restore balance and wholeness through healing practices',
      color: 'from-rose-400 to-pink-600',
      position: 'bottom-1/4 left-0 -translate-x-1/4',
      action: () => onSelectNode?.('healing')
    },
    {
      id: 'wisdom',
      name: 'Cosmic Wisdom',
      icon: <Star size={24} />,
      description: 'Access universal knowledge and higher guidance',
      color: 'from-amber-400 to-yellow-500',
      position: 'top-1/4 left-0 -translate-x-1/4',
      action: () => onSelectNode?.('wisdom')
    },
    {
      id: 'astral',
      name: 'Astral Travel',
      icon: <Sparkles size={24} />,
      description: 'Journey beyond physical limitations',
      color: 'from-violet-400 to-purple-600',
      position: 'top-[15%] left-[15%]',
      action: () => onSelectNode?.('astral')
    },
    {
      id: 'sacred',
      name: 'Sacred Geometry',
      icon: <Triangle size={24} />,
      description: 'Explore the mathematical patterns of creation',
      color: 'from-emerald-400 to-green-600',
      position: 'top-[15%] right-[15%]',
      action: () => onSelectNode?.('sacred')
    },
    {
      id: 'elements',
      name: 'Elements',
      icon: <Flame size={24} />,
      description: 'Work with the fundamental forces of nature',
      color: 'from-red-400 to-amber-500',
      position: 'bottom-[15%] right-[15%]',
      action: () => onSelectNode?.('elements')
    },
    {
      id: 'consciousness',
      name: 'Consciousness',
      icon: <CircleDot size={24} />,
      description: 'Expand your awareness beyond ordinary limitations',
      color: 'from-blue-400 to-indigo-600',
      position: 'bottom-[15%] left-[15%]',
      action: () => onSelectNode?.('consciousness')
    },
    {
      id: 'nature',
      name: 'Nature Connection',
      icon: <Flower size={24} />,
      description: 'Harmonize with the natural world',
      color: 'from-green-400 to-teal-500',
      position: 'right-1/2 top-1/4 translate-x-1/2',
      action: () => onSelectNode?.('nature')
    },
    {
      id: 'guidance',
      name: 'Higher Guidance',
      icon: <Compass size={24} />,
      description: 'Connect with your inner wisdom and spiritual guides',
      color: 'from-violet-400 to-indigo-600',
      position: 'left-1/2 bottom-1/4 -translate-x-1/2',
      action: () => onSelectNode?.('guidance')
    }
  ];
  
  // Determine which nodes should be active based on energy points
  const getNodeStatus = (nodeIndex: number) => {
    // Use energy points to determine which nodes are unlocked
    const pointThresholds = [0, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    return {
      unlocked: energyPoints >= pointThresholds[Math.min(nodeIndex, pointThresholds.length - 1)],
      threshold: pointThresholds[Math.min(nodeIndex, pointThresholds.length - 1)]
    };
  };

  const handleNodeClick = (node: GeometryNode) => {
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
      <svg 
        viewBox="0 0 500 500" 
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
      >
        {/* Center circle */}
        <circle cx="250" cy="250" r="20" fill="none" stroke="rgba(255,255,255,0.5)" />
        
        {/* Inner circles */}
        <g fill="none" stroke="rgba(255,255,255,0.3)">
          <circle cx="250" cy="180" r="20" />
          <circle cx="320" cy="215" r="20" />
          <circle cx="320" cy="285" r="20" />
          <circle cx="250" cy="320" r="20" />
          <circle cx="180" cy="285" r="20" />
          <circle cx="180" cy="215" r="20" />
        </g>
        
        {/* Outer circles */}
        <g fill="none" stroke="rgba(255,255,255,0.2)">
          <circle cx="250" cy="110" r="20" />
          <circle cx="390" cy="180" r="20" />
          <circle cx="390" cy="320" r="20" />
          <circle cx="250" cy="390" r="20" />
          <circle cx="110" cy="320" r="20" />
          <circle cx="110" cy="180" r="20" />
        </g>
        
        {/* Connecting lines */}
        <g stroke="rgba(255,255,255,0.15)">
          {/* Inner hexagon */}
          <line x1="250" y1="180" x2="320" y2="215" />
          <line x1="320" y1="215" x2="320" y2="285" />
          <line x1="320" y1="285" x2="250" y2="320" />
          <line x1="250" y1="320" x2="180" y2="285" />
          <line x1="180" y1="285" x2="180" y2="215" />
          <line x1="180" y1="215" x2="250" y2="180" />
          
          {/* Outer hexagon */}
          <line x1="250" y1="110" x2="390" y2="180" />
          <line x1="390" y1="180" x2="390" y2="320" />
          <line x1="390" y1="320" x2="250" y2="390" />
          <line x1="250" y1="390" x2="110" y2="320" />
          <line x1="110" y1="320" x2="110" y2="180" />
          <line x1="110" y1="180" x2="250" y2="110" />
          
          {/* Connecting spokes */}
          <line x1="250" y1="250" x2="250" y2="110" />
          <line x1="250" y1="250" x2="390" y2="180" />
          <line x1="250" y1="250" x2="390" y2="320" />
          <line x1="250" y1="250" x2="250" y2="390" />
          <line x1="250" y1="250" x2="110" y2="320" />
          <line x1="250" y1="250" x2="110" y2="180" />
          
          {/* Inner connections */}
          <line x1="250" y1="250" x2="250" y2="180" />
          <line x1="250" y1="250" x2="320" y2="215" />
          <line x1="250" y1="250" x2="320" y2="285" />
          <line x1="250" y1="250" x2="250" y2="320" />
          <line x1="250" y1="250" x2="180" y2="285" />
          <line x1="250" y1="250" x2="180" y2="215" />
        </g>
      </svg>
      
      {/* Geometry Nodes */}
      {geometryNodes.map((node, index) => {
        const nodeStatus = getNodeStatus(index);
        return (
          <motion.div
            key={node.id}
            className={cn(
              "absolute",
              node.position,
              "z-10"
            )}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: nodeStatus.unlocked ? 1 : 0.5,
              scale: activeNode === node.id ? 1.1 : 1
            }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <GlowEffect 
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center cursor-pointer",
                "transition-all duration-300",
                nodeStatus.unlocked ? "bg-black/30" : "bg-black/50"
              )}
              color={nodeStatus.unlocked ? `${node.color.split(' ')[1]}80` : "rgba(100,100,100,0.3)"}
              intensity={activeNode === node.id ? "high" : "medium"}
              animation={activeNode === node.id ? "pulse" : "none"}
              interactive={nodeStatus.unlocked}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => setHoverNode(node.id)}
              onMouseLeave={() => setHoverNode(null)}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                "bg-gradient-to-br",
                nodeStatus.unlocked ? node.color : "from-gray-600 to-gray-700"
              )}>
                {node.icon}
              </div>
              
              {/* Tooltip */}
              {hoverNode === node.id && (
                <motion.div 
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-black/70 rounded text-center z-20"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="font-semibold text-white">{node.name}</div>
                  <div className="text-xs text-white/80 mt-1">{node.description}</div>
                  {!nodeStatus.unlocked && (
                    <div className="text-xs text-amber-400 mt-1">
                      Unlocks at {nodeStatus.threshold} energy points
                    </div>
                  )}
                </motion.div>
              )}
            </GlowEffect>
          </motion.div>
        );
      })}
      
      {/* Central Node */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <GlowEffect 
          className="w-24 h-24 rounded-full flex items-center justify-center"
          color="rgba(138, 92, 246, 0.6)"
          intensity="high"
          animation="pulse"
          interactive
          onClick={() => onSelectNode?.('cosmic-center')}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-700 flex items-center justify-center">
            <span className="text-lg font-bold">{energyPoints}</span>
          </div>
        </GlowEffect>
      </motion.div>
    </div>
  );
};

export default MetatronsCube;
