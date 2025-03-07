
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadableMaterial } from '@/components/sacred-geometry/types/geometry';
import { SacredGeometryIcon } from '@/components/sacred-geometry/icons/SacredGeometryIcons';

interface CentralNodeProps {
  energyPoints: number;
  onSelectNode?: (nodeId: string, downloadables?: DownloadableMaterial[]) => void;
}

const CentralNode: React.FC<CentralNodeProps> = ({ energyPoints, onSelectNode }) => {
  const [pulse, setPulse] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  // Determine size based on energy points
  const getNodeSize = () => {
    const baseSize = 24; // base size for 0 energy points
    const maxSizeIncrease = 16; // maximum additional size
    const energyFactor = Math.min(energyPoints / 1000, 1); // cap at 1000 points
    
    return baseSize + (maxSizeIncrease * energyFactor);
  };
  
  // Continuous slow rotation
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev - 0.2) % 360);
    }, 50);
    
    return () => clearInterval(rotationInterval);
  }, []);
  
  // Set up pulse effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      
      // Reset pulse after animation
      setTimeout(() => setPulse(false), 1500);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleClick = () => {
    setPulse(true);
    
    if (onSelectNode) {
      onSelectNode('portal-center', [
        {
          id: 'central-meditation',
          name: 'Cosmic Consciousness Meditation',
          description: 'Connect with the quantum field through guided meditation',
          type: 'audio',
          icon: null
        },
        {
          id: 'sacred-geometry-guide',
          name: 'Sacred Geometry Field Guide',
          description: 'Learn about the patterns and meanings of sacred geometry',
          type: 'pdf',
          icon: null
        }
      ]);
    }
    
    // Reset pulse after animation
    setTimeout(() => setPulse(false), 1500);
  };
  
  const nodeSize = getNodeSize();
  
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
      <AnimatePresence>
        {pulse && (
          <motion.div
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 z-0"
            style={{ width: nodeSize, height: nodeSize }}
          />
        )}
      </AnimatePresence>
      
      {/* Rotating outer ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-white/30 rounded-full z-10"
        style={{ 
          width: nodeSize * 1.5, 
          height: nodeSize * 1.5,
          rotate: `${rotation}deg`
        }}
      >
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-quantum-400 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-astral-400 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        
        <motion.div
          className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-ethereal-400 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        <motion.div
          className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-chakra-heart rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </motion.div>
      
      {/* Main central node */}
      <motion.div
        className="bg-gradient-to-br from-quantum-500 to-quantum-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-quantum-700/30 z-20"
        style={{ width: nodeSize, height: nodeSize }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
      >
        <div className="relative">
          <SacredGeometryIcon 
            type="metatron" 
            size={nodeSize * 0.7}
            color="rgba(255,255,255,0.9)"
            secondaryColor="rgba(255,255,255,0.6)"
            animated={true}
          />
          
          {/* Energy points indicator */}
          <motion.div 
            className="absolute -bottom-1 -right-1 bg-black/60 text-white text-[10px] px-1.5 rounded-full border border-white/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {energyPoints}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CentralNode;
