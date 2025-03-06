
import React, { useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';

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
  const nodesRef = useRef<{id: number, x: number, y: number, size: number, delay: number, duration: number}[]>([]);
  const connectionsRef = useRef<{id: string, from: number, to: number, duration: number, delay: number}[]>([]);
  
  // Generate nodes and connections only once unless props change
  useEffect(() => {
    // Generate random nodes with better distribution
    nodesRef.current = Array.from({ length: density }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 0.3 + 0.1, // 0.1-0.4rem size
      delay: Math.random() * 5,
      duration: (Math.random() * 30 + 50) / speed
    }));
    
    // Optimize connections between nodes
    const connections: {id: string, from: number, to: number, duration: number, delay: number}[] = [];
    for (let i = 0; i < nodesRef.current.length; i++) {
      // Connect each node to 2-3 closest nodes for better network density without overwhelming visuals
      const connectionsCount = Math.floor(Math.random() * 2) + 2;
      
      for (let j = 0; j < connectionsCount; j++) {
        // Create connections in a more distributed way
        const targetNodeIndex = (i + j + 1 + Math.floor(Math.random() * (nodesRef.current.length/4))) % nodesRef.current.length;
        connections.push({
          id: `${i}-${targetNodeIndex}`,
          from: i,
          to: targetNodeIndex,
          duration: (Math.random() * 20 + 40) / speed,
          delay: Math.random() * 2
        });
      }
    }
    connectionsRef.current = connections;
  }, [density, speed]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Animated nodes with improved visibility and reduced DOM elements */}
      {nodesRef.current.map((node) => (
        <motion.div
          key={`node-${node.id}`}
          className="absolute rounded-full"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${node.size}rem`,
            height: `${node.size}rem`,
            background: `radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 70%)`,
            willChange: 'opacity, transform', // Hint for browser optimization
          }}
          initial={{ opacity: 0.2, scale: 1 }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: node.duration,
            delay: node.delay,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      ))}
      
      {/* Lines connecting nodes - optimized with reduced motion and view-box based culling */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {connectionsRef.current.map((connection) => {
          const fromNode = nodesRef.current[connection.from];
          const toNode = nodesRef.current[connection.to];
          
          return (
            <motion.line
              key={`connection-${connection.id}`}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth="0.5"
              filter="url(#glow)"
              initial={{ strokeOpacity: 0 }}
              animate={{
                strokeOpacity: [0.2, 0.4, 0.2], // Reduced opacity change for better performance
                strokeDasharray: ["5 3", "3 5", "5 3"],
              }}
              transition={{
                duration: connection.duration,
                delay: connection.delay,
                repeat: Infinity,
                repeatType: "mirror"
              }}
            />
          );
        })}
      </svg>
      
      {/* Optimized background glass effect with reduced blur for better performance */}
      <div className="absolute inset-0 bg-gradient-to-b from-quantum-900/50 to-quantum-900/30 backdrop-blur-[30px]" />
      
      {/* Simplified central glow effect */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(138, 92, 246, 0.2) 0%, rgba(138, 92, 246, 0) 70%)",
          willChange: 'transform, opacity', // Hint for browser optimization
        }}
        initial={{ opacity: 0.3, scale: 1 }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />
    </div>
  );
});

GeometryNetworkBackground.displayName = 'GeometryNetworkBackground';

export default GeometryNetworkBackground;
