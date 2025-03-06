
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GeometryNetworkBackgroundProps {
  className?: string;
}

const GeometryNetworkBackground: React.FC<GeometryNetworkBackgroundProps> = ({ className }) => {
  const [nodes, setNodes] = useState<{ x: number; y: number; id: number }[]>([]);
  const [connections, setConnections] = useState<{ from: number; to: number; id: string }[]>([]);

  useEffect(() => {
    // Generate random nodes
    const nodeCount = 15;
    const newNodes = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      id: i
    }));
    
    setNodes(newNodes);
    
    // Generate connections between nodes
    const newConnections: { from: number; to: number; id: string }[] = [];
    
    newNodes.forEach((node, i) => {
      // Connect each node to 1-3 other nodes
      const connectionCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < connectionCount; j++) {
        const toIndex = Math.floor(Math.random() * nodeCount);
        
        // Avoid self-connections and duplicates
        if (toIndex !== i && !newConnections.some(c => 
          (c.from === i && c.to === toIndex) || 
          (c.from === toIndex && c.to === i))
        ) {
          // Ensure unique IDs for connections
          newConnections.push({ 
            from: i, 
            to: toIndex, 
            id: `connection-${i}-${toIndex}` 
          });
        }
      }
    });
    
    setConnections(newConnections);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className || ''}`}>
      <svg width="100%" height="100%" className="absolute opacity-20">
        {connections.map(connection => {
          const fromNode = nodes[connection.from];
          const toNode = nodes[connection.to];
          
          if (!fromNode || !toNode) return null;
          
          return (
            <line
              key={connection.id}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="0.5"
            />
          );
        })}
        
        {nodes.map(node => (
          <motion.circle
            key={`node-${node.id}`}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="2"
            fill="rgba(255, 255, 255, 0.3)"
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              opacity: [0, 0.8, 0.5]
            }}
            transition={{ 
              duration: 2,
              delay: node.id * 0.1,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: Math.random() * 5 + 5
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default GeometryNetworkBackground;
