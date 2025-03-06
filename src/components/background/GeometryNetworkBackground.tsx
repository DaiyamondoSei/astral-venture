
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface GeometryNetworkBackgroundProps {
  density?: number; // Number of nodes
  speed?: number; // Animation speed
  className?: string;
}

const GeometryNetworkBackground: React.FC<GeometryNetworkBackgroundProps> = ({
  density = 20,
  speed = 1,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate random nodes for the network
  const nodes = Array.from({ length: density }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 0.3 + 0.1, // 0.1-0.4rem size
    delay: Math.random() * 5,
    duration: (Math.random() * 30 + 50) / speed
  }));
  
  // Generate connections between nodes
  const connections = [];
  for (let i = 0; i < nodes.length; i++) {
    // Connect each node to 2-4 closest nodes for better network density
    const connectionsCount = Math.floor(Math.random() * 3) + 2;
    
    for (let j = 0; j < connectionsCount; j++) {
      // Create connections in a more distributed way
      const targetNodeIndex = (i + j + 1 + Math.floor(Math.random() * (nodes.length/4))) % nodes.length;
      connections.push({
        id: `${i}-${targetNodeIndex}`,
        from: i,
        to: targetNodeIndex,
        duration: (Math.random() * 20 + 40) / speed,
        delay: Math.random() * 2
      });
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Animated nodes */}
      {nodes.map((node) => (
        <motion.div
          key={`node-${node.id}`}
          className="absolute rounded-full"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${node.size}rem`,
            height: `${node.size}rem`,
            background: `radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 70%)`,
          }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: node.duration,
            delay: node.delay,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      ))}
      
      {/* Lines connecting nodes - improved with gradients and pulse animations */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {connections.map((connection) => {
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
              filter="url(#glow)"
              initial={{ strokeOpacity: 0 }}
              animate={{
                strokeOpacity: [0.1, 0.4, 0.1],
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
      
      {/* Improved background glass effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-quantum-900/40 to-quantum-900/20 backdrop-blur-[80px]" />
      
      {/* Subtle pulse effect in the center */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(138, 92, 246, 0.15) 0%, rgba(138, 92, 246, 0) 70%)",
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />
    </div>
  );
};

export default GeometryNetworkBackground;
