
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MetatronsNode, GlowIntensity } from './types';

interface CubeNodeProps {
  node: MetatronsNode;
  primaryColor: string;
  secondaryColor: string;
  isActive?: boolean;
  onClick?: (nodeId: string) => void;
  glowIntensity: GlowIntensity;
  isSimplified?: boolean;
}

const getGlowStrength = (intensity: GlowIntensity): string => {
  switch (intensity) {
    case 'high': return '3';
    case 'medium': return '2.5';
    case 'low': return '1.5';
    default: return '2';
  }
};

const CubeNode: React.FC<CubeNodeProps> = ({
  node,
  primaryColor,
  secondaryColor,
  isActive = false,
  onClick,
  glowIntensity,
  isSimplified = false
}) => {
  const nodeSize = isActive ? 12 : 8;
  const filterId = `node-glow-${glowIntensity}`;
  
  const handleClick = () => {
    if (onClick) {
      onClick(node.id);
    }
  };
  
  return (
    <>
      {!isSimplified && isActive && (
        <svg width="0" height="0">
          <defs>
            <filter id={filterId}>
              <feGaussianBlur stdDeviation={getGlowStrength(glowIntensity)} result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>
      )}
      
      <motion.div
        className={cn(
          "absolute rounded-full cursor-pointer",
          isActive ? "z-20" : "z-10"
        )}
        style={{
          left: `${node.x}%`,
          top: `${node.y}%`,
          width: `${nodeSize}px`,
          height: `${nodeSize}px`,
          backgroundColor: isActive ? primaryColor : secondaryColor,
          filter: isActive && !isSimplified ? `url(#${filterId})` : undefined,
          transform: 'translate(-50%, -50%)'
        }}
        initial={{ scale: 0 }}
        animate={{ 
          scale: 1,
          opacity: isActive ? 1 : 0.7
        }}
        transition={{ 
          duration: 0.5,
          delay: 0.1 * (parseInt(node.id) % 5)
        }}
        whileHover={{ scale: 1.2 }}
        onClick={handleClick}
      />
    </>
  );
};

export default CubeNode;
