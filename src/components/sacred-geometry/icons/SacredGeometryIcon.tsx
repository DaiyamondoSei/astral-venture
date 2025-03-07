
import React from 'react';
import { motion } from 'framer-motion';

interface SacredGeometryIconProps {
  type: string;
  size?: number;
  color?: string;
  secondaryColor?: string;
  animated?: boolean;
}

export const SacredGeometryIcon: React.FC<SacredGeometryIconProps> = ({ 
  type, 
  size = 24, 
  color = "white", 
  secondaryColor = "rgba(255,255,255,0.5)",
  animated = false
}) => {
  const iconSize = size;
  const viewBox = "0 0 24 24";

  // Animation variants
  const pulseAnimation = animated ? {
    scale: [1, 1.1, 1],
    rotate: [0, 5, 0, -5, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  } : {};

  // Render the appropriate sacred geometry icon based on type
  const renderIcon = () => {
    switch (type) {
      case 'flower-of-life':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <circle cx="12" cy="12" r="5" />
            <circle cx="7" cy="12" r="5" />
            <circle cx="17" cy="12" r="5" />
            <circle cx="9.5" cy="7.5" r="5" />
            <circle cx="14.5" cy="7.5" r="5" />
            <circle cx="9.5" cy="16.5" r="5" />
            <circle cx="14.5" cy="16.5" r="5" />
          </g>
        );
        
      case 'metatron':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <circle cx="12" cy="12" r="11" />
            <polygon points="12,1 23,12 12,23 1,12" />
            <line x1="12" y1="1" x2="12" y2="23" />
            <line x1="1" y1="12" x2="23" y2="12" />
            <line x1="4" y1="4" x2="20" y2="20" />
            <line x1="4" y1="20" x2="20" y2="4" />
          </g>
        );
      
      case 'seed-of-life':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="6" r="3" />
            <circle cx="12" cy="18" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="12" r="3" />
            <circle cx="7.76" cy="7.76" r="3" />
            <circle cx="16.24" cy="7.76" r="3" />
            <circle cx="7.76" cy="16.24" r="3" />
            <circle cx="16.24" cy="16.24" r="3" />
          </g>
        );
      
      case 'tree-of-life':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <circle cx="12" cy="3" r="2" />
            <circle cx="6" cy="7" r="2" />
            <circle cx="18" cy="7" r="2" />
            <circle cx="12" cy="11" r="2" />
            <circle cx="6" cy="15" r="2" />
            <circle cx="18" cy="15" r="2" />
            <circle cx="9" cy="19" r="2" />
            <circle cx="15" cy="19" r="2" />
            <circle cx="12" cy="21" r="2" />
            <line x1="12" y1="5" x2="12" y2="9" />
            <line x1="8" y1="7" x2="16" y2="7" />
            <line x1="8" y1="15" x2="16" y2="15" />
            <line x1="7" y1="9" x2="11" y2="13" />
            <line x1="17" y1="9" x2="13" y2="13" />
            <line x1="7" y1="13" x2="11" y2="9" />
            <line x1="17" y1="13" x2="13" y2="9" />
          </g>
        );
      
      case 'vesica-piscis':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <circle cx="9" cy="12" r="7" />
            <circle cx="15" cy="12" r="7" />
          </g>
        );
      
      case 'sri-yantra':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <polygon points="12,2 2,22 22,22" />
            <polygon points="12,5 5,20 19,20" />
            <polygon points="12,8 8,18 16,18" />
            <polygon points="12,20 7,10 17,10" />
            <polygon points="12,14 10,10 14,10" />
          </g>
        );
      
      case 'merkaba':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <polygon points="12,2 3,18 21,18" stroke={color} />
            <polygon points="12,22 3,6 21,6" stroke={secondaryColor} />
          </g>
        );
      
      case 'torus':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <ellipse cx="12" cy="12" rx="8" ry="10" />
            <ellipse cx="12" cy="12" rx="10" ry="8" />
            <ellipse cx="12" cy="12" rx="9" ry="9" />
          </g>
        );
      
      case 'golden-spiral':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <path d="M12,12 L12,6 A6,6 0 0,1 18,12 A6,6 0 0,1 12,18 A6,6 0 0,1 6,12 A6,6 0 0,1 12,6" />
          </g>
        );
      
      case 'pentagram':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <polygon points="12,2 5,22 21,9 3,9 19,22" />
          </g>
        );
      
      case 'hexagram':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <polygon points="12,2 4,12 12,22 20,12" />
            <polygon points="4,12 12,8 20,12 12,16" />
          </g>
        );
      
      case 'octagram':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <polygon points="12,2 8,5 5,8 2,12 5,16 8,19 12,22 16,19 19,16 22,12 19,8 16,5" />
          </g>
        );
      
      case 'infinity':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <path d="M6,12 C6,9 9,9 12,12 C15,15 18,15 18,12 C18,9 15,9 12,12 C9,15 6,15 6,12 Z" />
          </g>
        );
      
      case 'platonic-solid':
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <polygon points="12,2 2,8 2,16 12,22 22,16 22,8" />
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="2" y1="8" x2="22" y2="8" />
            <line x1="2" y1="16" x2="22" y2="16" />
          </g>
        );
      
      default:
        // Default metatron's cube simplified
        return (
          <g fill="none" stroke={color} strokeWidth="1">
            <circle cx="12" cy="12" r="10" />
            <polygon points="12,2 22,12 12,22 2,12" />
          </g>
        );
    }
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconSize}
      height={iconSize}
      viewBox={viewBox}
      animate={pulseAnimation}
    >
      {renderIcon()}
    </motion.svg>
  );
};

export default SacredGeometryIcon;
