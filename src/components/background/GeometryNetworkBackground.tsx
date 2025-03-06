
import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { getAnimationQualityLevel, isLowPerformanceDevice } from '@/utils/performanceUtils';

interface GeometryNetworkBackgroundProps {
  density?: number; // Number of nodes
  speed?: number; // Animation speed
  className?: string;
}

const GeometryNetworkBackground: React.FC<GeometryNetworkBackgroundProps> = memo(({
  density = 20,
  speed = 1,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [qualityLevel, setQualityLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [optimizedDensity, setOptimizedDensity] = useState(density);
  
  // Generate optimized node and connection configurations
  const generateOptimizedConfigurations = useCallback(() => {
    const quality = getAnimationQualityLevel();
    setQualityLevel(quality);
    
    // Adjust density based on quality level
    const densityMultiplier = quality === 'high' ? 1 : quality === 'medium' ? 0.7 : 0.4;
    setOptimizedDensity(Math.max(5, Math.floor(density * densityMultiplier)));
  }, [density]);
  
  // Run optimization on mount and when dependencies change
  useEffect(() => {
    generateOptimizedConfigurations();
    
    // Update quality level if device performance changes (e.g., battery saver mode)
    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMediaChange = () => {
      generateOptimizedConfigurations();
    };
    
    // Modern browsers
    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', handleMediaChange);
      return () => mediaQueryList.removeEventListener('change', handleMediaChange);
    }
    
    return undefined;
  }, [generateOptimizedConfigurations]);
  
  // Memoize nodes to prevent unnecessary recalculations
  const nodes = React.useMemo(() => {
    return Array.from({ length: optimizedDensity }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 0.3 + 0.1, // 0.1-0.4rem size
      delay: Math.random() * 5,
      duration: (Math.random() * 30 + 50) / speed
    }));
  }, [optimizedDensity, speed]);
  
  // Memoize connections to prevent unnecessary recalculations
  const connections = React.useMemo(() => {
    const result: {id: string, from: number, to: number, duration: number, delay: number}[] = [];
    
    // Create optimized connection patterns based on quality level
    const connectionsPerNode = qualityLevel === 'high' ? 3 : qualityLevel === 'medium' ? 2 : 1;
    
    for (let i = 0; i < nodes.length; i++) {
      const actualConnections = Math.min(connectionsPerNode, Math.floor(Math.random() * 2) + 1);
      
      for (let j = 0; j < actualConnections; j++) {
        // Create connections in a more distributed way
        const targetNodeIndex = (i + j + 1 + Math.floor(Math.random() * (nodes.length/4))) % nodes.length;
        result.push({
          id: `${i}-${targetNodeIndex}`,
          from: i,
          to: targetNodeIndex,
          duration: (Math.random() * 20 + 40) / speed,
          delay: Math.random() * 2
        });
      }
    }
    
    return result;
  }, [nodes, speed, qualityLevel]);

  // Use reduced motion configuration for low-performance devices
  const animationConfig = React.useMemo(() => {
    const isLowPerformance = isLowPerformanceDevice();
    
    return {
      node: {
        duration: isLowPerformance ? nodes[0]?.duration * 1.5 : nodes[0]?.duration,
        opacity: isLowPerformance ? [0.2, 0.4, 0.2] : [0.2, 0.5, 0.2],
        scale: isLowPerformance ? [1, 1.2, 1] : [1, 1.4, 1],
        repeatType: "mirror" as const
      },
      connection: {
        duration: isLowPerformance ? connections[0]?.duration * 1.5 : connections[0]?.duration,
        opacity: isLowPerformance ? [0.1, 0.2, 0.1] : [0.2, 0.4, 0.2],
        strokeDasharray: isLowPerformance ? ["5 5", "5 5"] : ["5 3", "3 5", "5 3"],
        repeatType: "mirror" as const
      }
    };
  }, [nodes, connections]);

  // Apply different rendering strategies based on device capability
  const renderNodes = () => {
    // For low-performance devices, render fewer nodes with simplified animations
    if (qualityLevel === 'low') {
      return nodes.filter((_, index) => index % 2 === 0).map((node) => (
        <motion.div
          key={`node-${node.id}`}
          className="absolute rounded-full"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${node.size}rem`,
            height: `${node.size}rem`,
            background: `radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 70%)`,
            willChange: 'opacity',
          }}
          initial={{ opacity: 0.2 }}
          animate={{
            opacity: animationConfig.node.opacity,
          }}
          transition={{
            duration: animationConfig.node.duration,
            delay: node.delay,
            repeat: Infinity,
            repeatType: animationConfig.node.repeatType,
          }}
        />
      ));
    }
    
    // For medium to high performance devices, render all nodes with appropriate animations
    return nodes.map((node) => (
      <motion.div
        key={`node-${node.id}`}
        className="absolute rounded-full"
        style={{
          left: `${node.x}%`,
          top: `${node.y}%`,
          width: `${node.size}rem`,
          height: `${node.size}rem`,
          background: `radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 70%)`,
          willChange: qualityLevel === 'high' ? 'opacity, transform' : 'opacity',
        }}
        initial={{ opacity: 0.2, scale: 1 }}
        animate={{
          opacity: animationConfig.node.opacity,
          scale: qualityLevel === 'high' ? animationConfig.node.scale : [1, 1.1, 1],
        }}
        transition={{
          duration: animationConfig.node.duration,
          delay: node.delay,
          repeat: Infinity,
          repeatType: animationConfig.node.repeatType,
        }}
      />
    ));
  };

  // Apply different connection rendering strategies based on device capability
  const renderConnections = () => {
    // For low-performance devices, render fewer connections with simplified animations
    const renderSet = qualityLevel === 'low' 
      ? connections.filter((_, index) => index % 3 === 0)
      : qualityLevel === 'medium'
        ? connections.filter((_, index) => index % 2 === 0)
        : connections;
    
    return (
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
          {qualityLevel === 'high' && (
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>
        
        {renderSet.map((connection) => {
          const fromNode = nodes[connection.from];
          const toNode = nodes[connection.to];
          
          return (
            <motion.line
              key={`connection-${connection.id}`}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth="0.5"
              filter={qualityLevel === 'high' ? "url(#glow)" : undefined}
              initial={{ strokeOpacity: 0 }}
              animate={{
                strokeOpacity: animationConfig.connection.opacity,
                strokeDasharray: qualityLevel === 'high' 
                  ? animationConfig.connection.strokeDasharray 
                  : "5 5",
              }}
              transition={{
                duration: animationConfig.connection.duration,
                delay: connection.delay,
                repeat: Infinity,
                repeatType: animationConfig.connection.repeatType
              }}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Render nodes with optimized approach */}
      {renderNodes()}
      
      {/* Render connections with optimized approach */}
      {renderConnections()}
      
      {/* Background glass effect with reduced complexity based on device capability */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-quantum-900/50 to-quantum-900/30"
        style={{
          backdropFilter: qualityLevel === 'low' ? 'blur(10px)' : 'blur(30px)',
        }}
      />
      
      {/* Central glow effect - simplified for low-end devices */}
      {qualityLevel !== 'low' && (
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(138, 92, 246, 0.2) 0%, rgba(138, 92, 246, 0) 70%)",
            willChange: 'transform, opacity',
          }}
          initial={{ opacity: 0.3, scale: 1 }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: qualityLevel === 'medium' ? 10 : 8,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      )}
    </div>
  );
});

GeometryNetworkBackground.displayName = 'GeometryNetworkBackground';

export default GeometryNetworkBackground;
