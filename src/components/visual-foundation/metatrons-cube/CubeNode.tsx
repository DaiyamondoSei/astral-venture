
import React from 'react';
import { motion } from 'framer-motion';
import { MetatronsNode, GlowIntensity } from './MetatronsCube';

interface CubeNodeProps {
  node: MetatronsNode;
  primaryColor: string;
  secondaryColor: string;
  isActive?: boolean;
  onClick: (nodeId: string) => void;
  glowIntensity: GlowIntensity;
  isSimplified: boolean;
}

const CubeNode: React.FC<CubeNodeProps> = ({
  node,
  primaryColor,
  secondaryColor,
  isActive = false,
  onClick,
  glowIntensity,
  isSimplified
}) => {
  // Set filter intensity based on the glowIntensity prop
  const getFilterDeviation = () => {
    switch (glowIntensity) {
      case 'low': return '2';
      case 'medium': return '3';
      case 'high': return '5';
      default: return '3';
    }
  };
  
  // Determine node size
  const nodeSize = node.size || (isActive ? 16 : 12);
  
  // Position styles
  const positionStyles = {
    left: `${node.x}px`,
    top: `${node.y}px`,
    width: `${nodeSize}px`,
    height: `${nodeSize}px`,
    marginLeft: `-${nodeSize / 2}px`,
    marginTop: `-${nodeSize / 2}px`,
  };
  
  // Animation variants
  const variants = {
    active: {
      scale: [1, 1.15, 1],
      transition: { 
        duration: 2, 
        repeat: Infinity,
        repeatType: 'loop' as const
      }
    },
    inactive: {
      scale: 1
    }
  };
  
  const handleNodeClick = () => {
    onClick(node.id);
  };
  
  return (
    <>
      <motion.div
        className="absolute rounded-full cursor-pointer z-10"
        style={positionStyles}
        onClick={handleNodeClick}
        variants={variants}
        animate={node.pulsing ? 'active' : 'inactive'}
        whileHover={{ scale: 1.2 }}
        title={node.tooltip}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: isActive ? secondaryColor : primaryColor,
            boxShadow: isSimplified ? 'none' : `0 0 ${getFilterDeviation()}px ${isActive ? secondaryColor : primaryColor}`
          }}
        />
        
        {node.label && (
          <div 
            className="absolute whitespace-nowrap text-xs font-medium text-white"
            style={{
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%) translateY(8px)',
              textShadow: '0 0 4px rgba(0,0,0,0.8)'
            }}
          >
            {node.label}
          </div>
        )}
      </motion.div>
    </>
  );
};

export default CubeNode;
