
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SwipeablePanelProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position?: 'bottom' | 'right';
  height?: string;
  width?: string; 
  className?: string;
  showHandle?: boolean;
  allowClose?: boolean;
  backdrop?: boolean;
}

const SwipeablePanel: React.FC<SwipeablePanelProps> = ({
  children,
  isOpen,
  onClose,
  position = 'bottom',
  height = '50%',
  width = '100%',
  className,
  showHandle = true,
  allowClose = true,
  backdrop = true
}) => {
  const controls = useAnimation();
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Panel dimensions
  const isBottomPanel = position === 'bottom';
  const panelStyle = isBottomPanel 
    ? { height, width: '100%' }
    : { width, height: '100%' };
  
  // Initial position
  const initialPosition = isBottomPanel 
    ? { y: '100%' } 
    : { x: '100%' };
  
  // Open position 
  const openPosition = { x: 0, y: 0 };
  
  useEffect(() => {
    if (isOpen) {
      controls.start(openPosition);
    } else {
      controls.start(initialPosition);
    }
  }, [isOpen, controls, initialPosition, openPosition]);
  
  const handleDragEnd = (_: any, info: PanInfo) => {
    setDragging(false);
    
    if (!allowClose) {
      controls.start(openPosition);
      return;
    }
    
    const threshold = 100; // Pixels to trigger close
    const velocity = isBottomPanel ? info.velocity.y : info.velocity.x;
    const offset = isBottomPanel ? info.offset.y : info.offset.x;
    
    if (offset > threshold || velocity > 500) {
      onClose();
    } else {
      controls.start(openPosition);
    }
  };
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!allowClose) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const dragConstraints = useRef<any>(null);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className={cn(
        'fixed inset-0 z-50 overflow-hidden',
        backdrop ? 'bg-black/50' : 'pointer-events-none'
      )}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      onClick={handleBackdropClick}
    >
      <motion.div
        ref={containerRef}
        initial={initialPosition}
        animate={controls}
        exit={initialPosition}
        drag={isBottomPanel ? 'y' : 'x'}
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        className={cn(
          'absolute bg-background rounded-t-xl shadow-lg',
          isBottomPanel ? 'bottom-0 left-0 right-0' : 'top-0 bottom-0 right-0',
          isBottomPanel ? 'rounded-t-xl' : 'rounded-l-xl',
          'pointer-events-auto',
          className
        )}
        style={panelStyle}
      >
        {showHandle && isBottomPanel && (
          <div className="flex justify-center p-2">
            <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
          </div>
        )}
        
        {showHandle && !isBottomPanel && (
          <div className="absolute top-1/2 left-2 -translate-y-1/2">
            <div className="h-12 w-1.5 bg-muted-foreground/20 rounded-full" />
          </div>
        )}
        
        <div 
          className={cn(
            'overflow-y-auto',
            isBottomPanel ? 'h-full' : 'h-full w-full'
          )}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SwipeablePanel;
