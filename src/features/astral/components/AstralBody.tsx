
import React from 'react';
import { motion } from 'framer-motion';

interface AstralBodyProps {
  energyLevel?: number;
  activeNodes?: number[];
  interactive?: boolean;
  onNodeClick?: (nodeId: number) => void;
}

const AstralBody: React.FC<AstralBodyProps> = ({
  energyLevel = 0,
  activeNodes = [],
  interactive = false,
  onNodeClick
}) => {
  // Calculate opacity and scale based on energy level
  const intensity = Math.min(1, Math.max(0.2, energyLevel / 100));
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Main aura */}
      <motion.div
        className="absolute rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 blur-lg"
        initial={{ scale: 0.8, opacity: 0.2 }}
        animate={{ 
          scale: [0.8, 0.9, 0.8],
          opacity: [intensity * 0.3, intensity * 0.5, intensity * 0.3] 
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
        style={{ width: '80%', height: '80%' }}
      />
      
      {/* Energy body outline */}
      <motion.div
        className="absolute w-40 h-80 rounded-full border-2 border-purple-500/30"
        initial={{ opacity: 0.5 }}
        animate={{ 
          opacity: [0.3, 0.7, 0.3],
          boxShadow: [
            '0 0 20px rgba(168, 85, 247, 0.1)',
            '0 0 40px rgba(168, 85, 247, 0.2)',
            '0 0 20px rgba(168, 85, 247, 0.1)'
          ]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />
      
      {/* Energy nodes (chakras) */}
      {Array.from({ length: 7 }).map((_, index) => {
        const isActive = activeNodes.includes(index);
        const nodeColor = getChakraColor(index);
        const yPosition = 30 + index * 30; // Distribute along the body
        
        return (
          <motion.div
            key={index}
            className={`absolute rounded-full cursor-pointer
              ${interactive ? 'hover:brightness-125 hover:scale-110' : ''}
              ${isActive ? 'z-10' : 'opacity-50'}
            `}
            style={{ 
              backgroundColor: nodeColor,
              width: isActive ? '28px' : '20px',
              height: isActive ? '28px' : '20px',
              top: `${yPosition}%`,
            }}
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: isActive ? [1, 1.2, 1] : 1,
              boxShadow: isActive 
                ? ['0 0 10px ' + nodeColor, '0 0 20px ' + nodeColor, '0 0 10px ' + nodeColor]
                : '0 0 5px ' + nodeColor
            }}
            transition={{ 
              duration: isActive ? 3 : 0,
              repeat: isActive ? Infinity : 0,
              repeatType: "reverse"
            }}
            onClick={() => interactive && onNodeClick && onNodeClick(index)}
          />
        );
      })}
      
      {/* Energy streams */}
      {activeNodes.length > 1 && activeNodes.slice(0, -1).map((nodeId, index) => {
        const nextNodeId = activeNodes[index + 1];
        const startY = 30 + nodeId * 30;
        const endY = 30 + nextNodeId * 30;
        const height = endY - startY;
        
        return (
          <motion.div
            key={`stream-${nodeId}-${nextNodeId}`}
            className="absolute left-1/2 w-1 bg-gradient-to-b from-purple-500/50 to-indigo-500/50 rounded-full"
            style={{
              top: `${startY}%`,
              height: `${height}%`,
              transform: 'translateX(-50%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        );
      })}
    </div>
  );
};

// Get color for each chakra
const getChakraColor = (index: number): string => {
  const colors = [
    '#FF0000', // Root - Red
    '#FF8000', // Sacral - Orange
    '#FFFF00', // Solar Plexus - Yellow
    '#00FF00', // Heart - Green
    '#00FFFF', // Throat - Light Blue
    '#0000FF', // Third Eye - Indigo
    '#8000FF', // Crown - Violet
  ];
  return colors[index] || '#FFFFFF';
};

export default AstralBody;
