
import React from 'react';
import { motion } from 'framer-motion';
import { ChakraActivation } from './ChakraPoints';

interface ChakraConnectionsProps {
  chakras: ChakraActivation;
}

const ChakraConnections: React.FC<ChakraConnectionsProps> = ({ chakras }) => {
  // Animation variants for the connections
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (active: boolean) => ({
      pathLength: 1,
      opacity: active ? 0.6 : 0.1,
      transition: {
        pathLength: { type: "spring", duration: 1.5, bounce: 0 },
        opacity: { duration: 0.5 }
      }
    })
  };

  return (
    <>
      {/* Root to Sacral connection */}
      {(chakras.root || chakras.sacral) && (
        <motion.line 
          x1="100" y1="280" x2="100" y2="220" 
          stroke="rgba(255,255,255,0.8)" 
          strokeWidth={chakras.root && chakras.sacral ? "2" : "1"} 
          strokeDasharray="0.5 0.5"
          initial="hidden"
          animate="visible"
          custom={chakras.root && chakras.sacral}
          variants={pathVariants}
        />
      )}
      
      {/* Sacral to Solar connection */}
      {(chakras.sacral || chakras.solar) && (
        <motion.line 
          x1="100" y1="220" x2="100" y2="180" 
          stroke="rgba(255,255,255,0.8)" 
          strokeWidth={chakras.sacral && chakras.solar ? "2" : "1"} 
          strokeDasharray="0.5 0.5"
          initial="hidden"
          animate="visible"
          custom={chakras.sacral && chakras.solar}
          variants={pathVariants}
        />
      )}
      
      {/* Solar to Heart connection */}
      {(chakras.solar || chakras.heart) && (
        <motion.line 
          x1="100" y1="180" x2="100" y2="140" 
          stroke="rgba(255,255,255,0.8)" 
          strokeWidth={chakras.solar && chakras.heart ? "2" : "1"} 
          strokeDasharray="0.5 0.5"
          initial="hidden"
          animate="visible"
          custom={chakras.solar && chakras.heart}
          variants={pathVariants}
        />
      )}
      
      {/* Heart to Throat connection */}
      {(chakras.heart || chakras.throat) && (
        <motion.line 
          x1="100" y1="140" x2="100" y2="110" 
          stroke="rgba(255,255,255,0.8)" 
          strokeWidth={chakras.heart && chakras.throat ? "2" : "1"} 
          strokeDasharray="0.5 0.5"
          initial="hidden"
          animate="visible"
          custom={chakras.heart && chakras.throat}
          variants={pathVariants}
        />
      )}
      
      {/* Throat to Third Eye connection */}
      {(chakras.throat || chakras.third) && (
        <motion.line 
          x1="100" y1="110" x2="100" y2="90" 
          stroke="rgba(255,255,255,0.8)" 
          strokeWidth={chakras.throat && chakras.third ? "2" : "1"} 
          strokeDasharray="0.5 0.5"
          initial="hidden"
          animate="visible"
          custom={chakras.throat && chakras.third}
          variants={pathVariants}
        />
      )}
      
      {/* Third Eye to Crown connection */}
      {(chakras.third || chakras.crown) && (
        <motion.line 
          x1="100" y1="90" x2="100" y2="60" 
          stroke="rgba(255,255,255,0.8)" 
          strokeWidth={chakras.third && chakras.crown ? "2" : "1"} 
          strokeDasharray="0.5 0.5"
          initial="hidden"
          animate="visible"
          custom={chakras.third && chakras.crown}
          variants={pathVariants}
        />
      )}
    </>
  );
};

export default ChakraConnections;
