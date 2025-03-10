
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface SwipeablePanelProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position: 'bottom' | 'right';
  height: string;
  initialState: 'open' | 'closed';
}

const SwipeablePanel: React.FC<SwipeablePanelProps> = ({
  children,
  isOpen,
  onClose,
  position = 'bottom',
  height = '70vh',
  initialState = 'closed'
}) => {
  // Animation variants based on panel position
  const variants = position === 'bottom' 
    ? {
        open: { y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { y: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
      }
    : {
        open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { x: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
      };

  // Style based on position
  const panelStyle = position === 'bottom'
    ? {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height,
        zIndex: 50,
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        background: 'rgba(7, 10, 25, 0.85)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden'
      }
    : {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '90vw',
        maxWidth: '450px',
        zIndex: 50,
        borderTopLeftRadius: '12px',
        borderBottomLeftRadius: '12px',
        background: 'rgba(7, 10, 25, 0.85)',
        backdropFilter: 'blur(10px)',
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden'
      };

  // Render panel conditionally based on isOpen state
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="panel-container"
          initial="closed"
          animate="open"
          exit="closed"
          variants={variants}
          style={panelStyle as any}
        >
          <div className="panel-header flex justify-between items-center p-4 border-b border-gray-800">
            <button
              onClick={onClose}
              className="close-button p-1 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Close panel"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <div className="panel-content p-4 overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SwipeablePanel;
