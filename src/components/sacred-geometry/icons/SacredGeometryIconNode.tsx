
import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import GlowEffect from '@/components/GlowEffect';
import { SacredGeometryIcon } from './SacredGeometryIcons';

export interface SacredGeometryIconNodeProps {
  id: string;
  name: string;
  type: 'metatron' | 'flower-of-life' | 'seed-of-life' | 'tree-of-life' | 
    'vesica-piscis' | 'sri-yantra' | 'merkaba' | 'torus' | 'golden-spiral' | 
    'pentagram' | 'hexagram' | 'octagram' | 'infinity' | 'platonic-solid';
  description: string;
  position: string;
  color: string;
  isActive?: boolean;
  isLocked?: boolean;
  hasDownloadables?: boolean;
  unlocked?: boolean;
  onClick?: () => void;
  onHover?: (nodeId: string | null) => void;
}

const SacredGeometryIconNode: React.FC<SacredGeometryIconNodeProps> = ({
  id,
  name,
  type,
  description,
  position,
  color,
  isActive = false,
  isLocked = false,
  hasDownloadables = false,
  unlocked = true,
  onClick,
  onHover
}) => {
  // Extract color values from tailwind class
  const getColorsFromGradient = (gradientClass: string) => {
    // Parse from-color-X to-color-Y format
    const fromMatch = gradientClass.match(/from-([a-z]+-\d+)/);
    const toMatch = gradientClass.match(/to-([a-z]+-\d+)/);
    
    const fromColor = fromMatch ? fromMatch[1] : 'quantum-500';
    const toColor = toMatch ? toMatch[1] : 'quantum-700';
    
    return { fromColor, toColor };
  };
  
  const { fromColor, toColor } = getColorsFromGradient(color);
  
  // Get the glow color based on the "to" color in the gradient
  const glowColor = `var(--${toColor.replace('-', '-color-')})`;
  
  return (
    <motion.div
      className={cn(
        "absolute",
        position,
        "z-10"
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: unlocked ? 1 : 0.6,
        scale: isActive ? 1.1 : 1
      }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => onHover?.(id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <GlowEffect 
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center cursor-pointer",
          "transition-all duration-300",
          unlocked ? "bg-black/30 backdrop-blur-md" : "bg-black/50",
          hasDownloadables && "ring-2 ring-white/30 ring-offset-2 ring-offset-transparent"
        )}
        color={unlocked ? `${glowColor}80` : "rgba(100,100,100,0.3)"}
        intensity={isActive ? "high" : "medium"}
        animation={isActive ? "pulse" : "none"}
        interactive={unlocked}
        onClick={unlocked ? onClick : undefined}
      >
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          "bg-gradient-to-br",
          unlocked ? color : "from-gray-600 to-gray-700",
          "relative backdrop-blur-sm"
        )}>
          <SacredGeometryIcon 
            type={type} 
            size={28} 
            color="rgba(255,255,255,0.9)" 
            secondaryColor="rgba(255,255,255,0.5)"
            animated={isActive}
          />
          
          {/* Download indicator */}
          {hasDownloadables && unlocked && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-quantum-600">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
          )}
          
          {/* Lock indicator */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/90">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          )}
        </div>
        
        {/* Tooltip on hover */}
        {onHover && (
          <motion.div 
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-black/70 backdrop-blur-md rounded text-center z-20"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="font-semibold text-white">{name}</div>
            <div className="text-xs text-white/80 mt-1">{description}</div>
            {hasDownloadables && unlocked && (
              <div className="text-xs text-quantum-300 mt-1 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Materials available
              </div>
            )}
            {isLocked && (
              <div className="text-xs text-amber-400 mt-1">
                Unlock by gaining more energy points
              </div>
            )}
          </motion.div>
        )}
      </GlowEffect>
    </motion.div>
  );
};

export default SacredGeometryIconNode;
