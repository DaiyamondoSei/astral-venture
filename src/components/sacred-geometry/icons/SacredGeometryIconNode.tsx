
import React, { useRef, useState } from 'react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import GlowEffect from '@/components/GlowEffect';
import { SacredGeometryIcon } from './SacredGeometryIcons';
import { getPerformanceCategory } from '@/utils/performanceUtils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const devicePerformance = getPerformanceCategory();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Determine size based on device
  const nodeSize = isMobile ? "w-12 h-12" : "w-16 h-16";
  const iconSize = isMobile ? 22 : 28;
  
  // Adjust animation quality based on device performance
  const useHighQualityAnimations = devicePerformance !== 'low';
  
  const getColorsFromGradient = (gradientClass: string) => {
    const fromMatch = gradientClass.match(/from-([a-z]+-\d+)/);
    const toMatch = gradientClass.match(/to-([a-z]+-\d+)/);
    
    const fromColor = fromMatch ? fromMatch[1] : 'quantum-500';
    const toColor = toMatch ? toMatch[1] : 'quantum-700';
    
    return { fromColor, toColor };
  };
  
  const { fromColor, toColor } = getColorsFromGradient(color);
  const glowColor = `var(--${toColor.replace('-', '-color-')})`;
  
  const handleNodeHover = (hovered: boolean) => {
    setIsHovered(hovered);
    
    // Add pulse animation when hovered
    if (hovered && unlocked && useHighQualityAnimations) {
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 1.2, repeat: Infinity }
      });
    } else {
      controls.stop();
      controls.set({ scale: 1 });
    }
    
    // Trigger parent hover handler
    if (onHover) {
      onHover(hovered ? id : null);
    }
  };
  
  // Handle touch for mobile devices
  const handleTouchStart = () => {
    if (isMobile) {
      handleNodeHover(true);
    }
  };
  
  const handleTouchEnd = () => {
    if (isMobile) {
      setTimeout(() => handleNodeHover(false), 1500);
    }
  };
  
  return (
    <motion.div
      ref={nodeRef}
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
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      onMouseEnter={() => handleNodeHover(true)}
      onMouseLeave={() => handleNodeHover(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <GlowEffect 
        className={cn(
          nodeSize,
          "rounded-full flex items-center justify-center cursor-pointer",
          "transition-all duration-300",
          unlocked ? "bg-black/30 backdrop-blur-md" : "bg-black/50",
          hasDownloadables && "ring-2 ring-white/40 ring-offset-1 ring-offset-black/20",
          isHovered && unlocked && "ring-2 ring-white/60 ring-offset-2 ring-offset-black/30"
        )}
        color={unlocked ? `${glowColor}90` : "rgba(100,100,100,0.4)"}
        intensity={isActive || isHovered ? "high" : "medium"}
        animation={isActive ? "pulse" : "none"}
        interactive={unlocked}
        onClick={unlocked ? onClick : undefined}
        ariaLabel={`${name} node. ${isLocked ? 'Locked.' : ''} ${hasDownloadables ? 'Has downloadable materials.' : ''}`}
      >
        <motion.div 
          className={cn(
            "w-3/4 h-3/4 rounded-full flex items-center justify-center",
            "bg-gradient-to-br",
            unlocked ? color : "from-gray-600 to-gray-700",
            "relative backdrop-blur-sm shadow-inner"
          )}
          animate={controls}
        >
          <SacredGeometryIcon 
            type={type} 
            size={iconSize} 
            color="rgba(255,255,255,0.9)" 
            secondaryColor="rgba(255,255,255,0.5)"
            animated={isActive || isHovered}
          />
          
          {hasDownloadables && unlocked && (
            <motion.div 
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg"
              initial={{ y: 0 }}
              animate={{ y: [0, -2, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: "loop",
                ease: "easeInOut"
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-quantum-600">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </motion.div>
          )}
          
          {isLocked && (
            <motion.div 
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: [0.8, 0.95, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/95">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </motion.div>
          )}
        </motion.div>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              className={cn(
                "absolute top-full left-1/2 -translate-x-1/2 mt-2",
                isMobile ? "w-36" : "w-48",
                "p-3 bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg text-center z-20 shadow-xl",
                isMobile && "text-xs"
              )}
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-display font-semibold text-white">{name}</div>
              <div className={cn(
                "text-white/90 mt-1",
                isMobile ? "text-xs" : "text-sm"
              )}>{description}</div>
              {hasDownloadables && unlocked && (
                <div className={cn(
                  "text-quantum-300 mt-2 flex items-center justify-center",
                  isMobile ? "text-[10px]" : "text-xs"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Materials available
                </div>
              )}
              {isLocked && (
                <div className={cn(
                  "text-amber-400 mt-2 flex items-center justify-center",
                  isMobile ? "text-[10px]" : "text-xs"  
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Unlock by gaining more energy points
                </div>
              )}
              
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-black/80"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlowEffect>
    </motion.div>
  );
};

export default React.memo(SacredGeometryIconNode);
