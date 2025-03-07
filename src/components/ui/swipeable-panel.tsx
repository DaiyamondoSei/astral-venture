
import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwipeablePanelProps {
  position: 'top' | 'bottom' | 'left' | 'right';
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  className?: string;
  closeThreshold?: number;
  allowOutsideClick?: boolean;
  showHandle?: boolean;
}

export const SwipeablePanel: React.FC<SwipeablePanelProps> = ({
  position = 'bottom',
  isOpen,
  onClose,
  children,
  size = 'medium',
  className,
  closeThreshold = 0.5,
  allowOutsideClick = true,
  showHandle = true
}) => {
  const controls = useAnimation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Calculate panel sizes based on position
  const getSizeStyle = () => {
    // Vertical panels (top/bottom)
    if (position === 'top' || position === 'bottom') {
      switch (size) {
        case 'small': return 'max-h-[25vh]';
        case 'medium': return 'max-h-[40vh]';
        case 'large': return 'max-h-[75vh]';
        case 'full': return 'h-full';
        default: return 'max-h-[40vh]';
      }
    }
    // Horizontal panels (left/right)
    else {
      switch (size) {
        case 'small': return 'max-w-[25vw]';
        case 'medium': return 'max-w-[40vw]';
        case 'large': return 'max-w-[75vw]';
        case 'full': return 'w-full';
        default: return 'max-w-[40vw]';
      }
    }
  };
  
  // Get position styles
  const getPositionStyle = () => {
    switch (position) {
      case 'top': return 'top-0 left-0 right-0';
      case 'bottom': return 'bottom-0 left-0 right-0';
      case 'left': return 'left-0 top-0 bottom-0';
      case 'right': return 'right-0 top-0 bottom-0';
      default: return 'bottom-0 left-0 right-0';
    }
  };
  
  // Handle drag end
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    // Check if drag distance exceeds threshold
    const shouldClose = position === 'top' 
      ? info.offset.y < 0 && info.offset.y < -panelRef.current!.offsetHeight * closeThreshold
      : position === 'bottom'
      ? info.offset.y > 0 && info.offset.y > panelRef.current!.offsetHeight * closeThreshold
      : position === 'left'
      ? info.offset.x < 0 && info.offset.x < -panelRef.current!.offsetWidth * closeThreshold
      : position === 'right'
      ? info.offset.x > 0 && info.offset.x > panelRef.current!.offsetWidth * closeThreshold
      : false;
    
    if (shouldClose) {
      onClose();
    } else {
      // Reset position
      controls.start('animate');
    }
  };
  
  // Close when clicking outside
  useEffect(() => {
    if (!isOpen || !allowOutsideClick) return;
    
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && !isDragging) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose, allowOutsideClick, isDragging]);
  
  // Synchronize controls with isOpen
  useEffect(() => {
    if (isOpen) {
      controls.start('animate');
    } else {
      controls.start('exit');
    }
  }, [isOpen, controls]);
  
  // Get orientation based on position
  const isVertical = position === 'top' || position === 'bottom';
  
  if (!isOpen) return null;
  
  // Define motion variants
  const variants = {
    initial: position === 'top' ? { y: '-100%' } :
             position === 'bottom' ? { y: '100%' } :
             position === 'left' ? { x: '-100%' } :
             { x: '100%' },
    animate: { x: 0, y: 0 },
    exit: position === 'top' ? { y: '-100%' } :
          position === 'bottom' ? { y: '100%' } :
          position === 'left' ? { x: '-100%' } :
          { x: '100%' }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <motion.div
        ref={panelRef}
        className={cn(
          "absolute bg-gradient-to-b from-quantum-900/90 to-black/80 backdrop-blur-md",
          "border border-white/10 overflow-auto",
          isVertical ? "rounded-t-xl" : "rounded-l-xl",
          getPositionStyle(),
          getSizeStyle(),
          "shadow-2xl",
          className
        )}
        initial="initial"
        animate={controls}
        exit="exit"
        variants={variants}
        drag={isVertical ? "y" : "x"}
        dragConstraints={{ 
          top: position === 'bottom' ? -1000 : 0, 
          bottom: position === 'top' ? 1000 : 0,
          left: position === 'right' ? -1000 : 0,
          right: position === 'left' ? 1000 : 0
        }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {showHandle && (
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 bg-white/30 rounded-full" />
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeablePanel;
