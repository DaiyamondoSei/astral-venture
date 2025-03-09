
import React, { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavigationNode from './NavigationNode';
import ConnectionLine from './ConnectionLine';
import { useNavCube } from '@/contexts/NavCubeContext';
import { useQuantumTheme } from '@/components/visual-foundation';
import GlassmorphicContainer from '@/components/visual-foundation/GlassmorphicContainer';
import { cn } from '@/lib/utils';

interface MetatronsCubeNavigationProps {
  className?: string;
  variant?: 'default' | 'ethereal' | 'astral' | 'quantum';
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onNodeSelect?: (nodeId: string) => void;
}

const MetatronsCubeNavigation = memo(({
  className,
  variant = 'default',
  showLabels = true,
  size = 'md',
  interactive = true,
  onNodeSelect
}: MetatronsCubeNavigationProps) => {
  const { 
    nodes, 
    connections, 
    activeNodeId, 
    navigateToNode, 
    isNodeActive,
    isConnectionActive
  } = useNavCube();
  const navigate = useNavigate();
  const { getPrimaryColor, getSecondaryColor } = useQuantumTheme();
  const [isReady, setIsReady] = useState(false);
  
  // Determine size classes
  const sizeClasses = {
    sm: 'w-[300px] h-[300px]',
    md: 'w-[400px] h-[400px]',
    lg: 'w-[500px] h-[500px]'
  };
  
  // Handle node click
  const handleNodeClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    
    if (node && !node.isDisabled) {
      navigateToNode(nodeId);
      
      if (onNodeSelect) {
        onNodeSelect(nodeId);
      }
      
      // Navigate to route if provided
      if (node.route) {
        navigate(node.route);
      }
    }
  };
  
  // Stagger the appearance of elements for a more pleasing animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get theme colors
  const primaryColor = getPrimaryColor();
  const secondaryColor = getSecondaryColor();
  
  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const svgVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        delay: 0.3
      }
    }
  };

  return (
    <GlassmorphicContainer
      className={cn(
        sizeClasses[size],
        "relative flex items-center justify-center overflow-hidden",
        className
      )}
      variant={variant as any}
      intensity="low"
      withGlow
      glowColor={`rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.3)`}
    >
      <motion.div
        className="relative w-full h-full"
        initial="initial"
        animate={isReady ? "animate" : "initial"}
        variants={containerVariants}
      >
        {/* SVG Layer for connections */}
        <motion.svg
          className="absolute inset-0 w-full h-full"
          variants={svgVariants}
        >
          {connections.map(connection => {
            const fromNode = nodes.find(n => n.id === connection.from);
            const toNode = nodes.find(n => n.id === connection.to);
            
            if (!fromNode || !toNode) return null;
            
            const isActive = isConnectionActive(connection.from, connection.to);
            
            return (
              <ConnectionLine
                key={`connection-${connection.id}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                isActive={isActive}
                strokeColor="rgba(255, 255, 255, 0.15)"
                activeStrokeColor={`rgba(${parseInt(secondaryColor.slice(1, 3), 16)}, ${parseInt(secondaryColor.slice(3, 5), 16)}, ${parseInt(secondaryColor.slice(5, 7), 16)}, 0.7)`}
                strokeWidth={1}
                activeStrokeWidth={1.5}
                animationDuration={2}
              />
            );
          })}
        </motion.svg>
        
        {/* Nodes Layer */}
        <div className="absolute inset-0 w-full h-full">
          {nodes.map(node => (
            <NavigationNode
              key={`node-${node.id}`}
              id={node.id}
              label={node.label}
              description={node.description}
              x={node.x}
              y={node.y}
              isActive={isNodeActive(node.id)}
              isDisabled={node.isDisabled}
              iconType={node.iconType}
              onClick={interactive ? handleNodeClick : undefined}
            />
          ))}
        </div>
        
        {/* Central glow effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${primaryColor}20 0%, transparent 70%)`,
            mixBlendMode: 'overlay'
          }}
        />
      </motion.div>
    </GlassmorphicContainer>
  );
});

MetatronsCubeNavigation.displayName = 'MetatronsCubeNavigation';

export default MetatronsCubeNavigation;
