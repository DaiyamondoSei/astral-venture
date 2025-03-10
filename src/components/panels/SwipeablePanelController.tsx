
import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useDragControls } from 'framer-motion';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import SwipeIndicator from './SwipeIndicator';
import { usePanelState, PanelPosition } from '@/hooks/usePanelState';

/**
 * Props for the SwipeablePanelController component
 */
interface ISwipeablePanelProps {
  /** Content to display inside the panel */
  children: React.ReactNode;
  /** Initial open/closed state of the panel */
  initialState?: 'open' | 'closed';
  /** Position of the panel */
  position: PanelPosition;
  /** Height of the panel when fully open (bottom position) */
  height?: string;
  /** Width of the panel when fully open (right position) */
  width?: string;
  /** Custom class names for the panel */
  className?: string;
  /** Called when the panel is closed */
  onClose?: () => void;
  /** Whether to show the swipe indicator */
  showIndicator?: boolean;
  /** Panel title */
  title?: string;
}

/**
 * A panel that can be swiped to open and close
 */
const SwipeablePanelController: React.FC<ISwipeablePanelProps> = ({
  children,
  initialState = 'closed',
  position = 'bottom',
  height = '80vh',
  width = '350px',
  className = '',
  onClose,
  showIndicator = true,
  title
}) => {
  const [isOpen, setIsOpen] = useState(initialState === 'open');
  const panelRef = useRef<HTMLDivElement>(null);
  const controls = useDragControls();
  const { closePanel } = usePanelState();
  
  // Close the panel when escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  // Handle close action
  const handleClose = () => {
    setIsOpen(false);
    closePanel();
    if (onClose) onClose();
  };
  
  // Calculate variants based on position
  const variants = position === 'bottom' 
    ? {
        open: { y: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } },
        closed: { y: '100%', transition: { type: 'spring', damping: 30, stiffness: 300 } }
      }
    : {
        open: { x: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } },
        closed: { x: '100%', transition: { type: 'spring', damping: 30, stiffness: 300 } }
      };
  
  // Handle drag end event
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (position === 'bottom') {
      if (info.offset.y > 100) {
        handleClose();
      } else {
        setIsOpen(true);
      }
    } else {
      if (info.offset.x > 100) {
        handleClose();
      } else {
        setIsOpen(true);
      }
    }
  };
  
  return (
    <motion.div
      ref={panelRef}
      initial={initialState === 'open' ? 'open' : 'closed'}
      animate={isOpen ? 'open' : 'closed'}
      variants={variants}
      style={position === 'bottom' 
        ? { height, width: '100%', position: 'absolute', bottom: 0, left: 0, zIndex: 50 } 
        : { width, height: '100%', position: 'absolute', top: 0, right: 0, zIndex: 50 }
      }
      drag={position === 'bottom' ? 'y' : 'x'}
      dragControls={controls}
      dragConstraints={position === 'bottom' 
        ? { top: 0, bottom: 0 } 
        : { left: 0, right: 0 }
      }
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className={`bg-gray-900/90 backdrop-blur-md rounded-t-2xl ${className}`}
    >
      <div className="flex flex-col h-full">
        {/* Header with drag handle */}
        <div 
          className="cursor-grab active:cursor-grabbing p-2 flex justify-between items-center"
          onPointerDown={(e) => controls.start(e)}
        >
          {position === 'bottom' && showIndicator && <SwipeIndicator />}
          
          {title && (
            <h2 className="text-lg font-medium text-white flex-1 px-2">
              {title}
            </h2>
          )}
          
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
            aria-label="Close panel"
          >
            {position === 'bottom' 
              ? <ChevronDown className="h-5 w-5 text-gray-300" /> 
              : <ChevronLeft className="h-5 w-5 text-gray-300" />
            }
          </button>
        </div>
        
        {/* Panel content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeablePanelController;
