
import React, { useState, useRef, useEffect } from 'react';
import { useMotionValue, motion, PanInfo, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SwipeablePanelProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  initialPosition?: 'open' | 'closed';
  openSize?: string | number;
  closedSize?: string | number;
  onOpen?: () => void;
  onClose?: () => void;
  dragHandleHeight?: number;
  className?: string;
  showHandle?: boolean;
  minSwipeDistance?: number;
  restrictToWindowEdges?: boolean;
}

const SwipeablePanel: React.FC<SwipeablePanelProps> = ({
  children,
  direction = 'up',
  initialPosition = 'closed',
  openSize = '80vh',
  closedSize = '0px',
  onOpen,
  onClose,
  dragHandleHeight = 24,
  className,
  showHandle = true,
  minSwipeDistance = 50,
  restrictToWindowEdges = true,
}) => {
  const [isOpen, setIsOpen] = useState(initialPosition === 'open');
  const panelRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  // Set up motion values based on direction
  const isVertical = direction === 'up' || direction === 'down';
  const dragProp = isVertical ? 'y' : 'x';
  const dragMotionValue = useMotionValue(0);
  
  useEffect(() => {
    setIsOpen(initialPosition === 'open');
  }, [initialPosition]);

  // Handle drag end
  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = isVertical ? info.offset.y : info.offset.x;
    const velocity = isVertical ? info.velocity.y : info.velocity.x;
    
    // Determine direction sign (negative values for up/left)
    const directionSign = direction === 'up' || direction === 'left' ? -1 : 1;
    
    // Check if swipe was against the open/close direction
    const isSwipeWithDirection = (offset * directionSign) < 0;
    
    // Decide whether to open or close based on:
    // 1. Velocity (fast swipe)
    // 2. Offset distance (moved far enough)
    // 3. Current state and swipe direction
    if (
      Math.abs(velocity) > 500 || 
      Math.abs(offset) > minSwipeDistance
    ) {
      if (isSwipeWithDirection && !isOpen) {
        setIsOpen(true);
        onOpen?.();
      } else if (!isSwipeWithDirection && isOpen) {
        setIsOpen(false);
        onClose?.();
      }
    } else {
      // If velocity and distance aren't enough, revert to current state
      setIsOpen(isOpen);
    }
  };
  
  // Generate variants for animations
  const variants = {
    open: { 
      [dragProp]: 0 
    },
    closed: { 
      [dragProp]: direction === 'up' ? '100%' : 
                  direction === 'down' ? '-100%' : 
                  direction === 'left' ? '100%' : '-100%' 
    }
  };

  // Calculate style properties
  const style: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: isVertical ? '100%' : openSize,
    height: isVertical ? openSize : '100%',
    borderRadius: '12px',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'var(--background)',
    touchAction: 'none'
  };

  const handleStyle: React.CSSProperties = {
    width: isVertical ? '40px' : '4px',
    height: isVertical ? '4px' : '40px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
    margin: '8px auto',
    cursor: 'grab'
  };

  return (
    <div ref={constraintsRef} className={cn("swipeable-panel-container", className)}>
      <motion.div
        ref={panelRef}
        className="swipeable-panel"
        style={style}
        initial={initialPosition}
        animate={isOpen ? 'open' : 'closed'}
        variants={variants}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        drag={dragProp}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        dragMomentum={false}
      >
        {showHandle && (
          <div className="drag-handle" style={{ paddingTop: '8px' }}>
            <div style={handleStyle} />
          </div>
        )}
        <div className="panel-content" style={{ height: '100%', overflowY: 'auto', padding: '0 16px' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default SwipeablePanel;
