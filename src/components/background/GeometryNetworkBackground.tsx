
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
    // Connect each node to 2-3 closest nodes
    const connectionsCount = Math.floor(Math.random() * 2) + 1;
    
    for (let j = 0; j < connectionsCount; j++) {
      if (i + j + 1 < nodes.length) {
        connections.push({
          id: `${i}-${i + j + 1}`,
          from: i,
          to: i + j + 1,
          duration: (Math.random() * 20 + 40) / speed,
          delay: Math.random() * 2
        });
      }
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
          className="absolute w-1 h-1 bg-white rounded-full opacity-30"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${node.size}rem`,
            height: `${node.size}rem`
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
      
      {/* Lines connecting nodes */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
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
              strokeOpacity="0.3"
              initial={{ strokeOpacity: 0 }}
              animate={{
                strokeOpacity: [0.1, 0.3, 0.1]
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
      
      {/* Background glass effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-quantum-900/50 to-quantum-900/30 backdrop-blur-[100px]" />
    </div>
  );
};

export default GeometryNetworkBackground;
