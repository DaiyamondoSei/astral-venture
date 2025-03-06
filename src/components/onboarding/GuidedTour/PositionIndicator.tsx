
import React from 'react';

interface PositionIndicatorProps {
  position: 'top' | 'right' | 'bottom' | 'left';
}

const PositionIndicator: React.FC<PositionIndicatorProps> = ({ position }) => {
  return (
    <div
      className={`absolute w-3 h-3 bg-background border-t border-l border-quantum-500/30 transform rotate-45 ${
        position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1.5' :
        position === 'right' ? 'left-0 top-1/2 -translate-y-1/2 -translate-x-1.5' :
        position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1.5' :
        'right-0 top-1/2 -translate-y-1/2 translate-x-1.5'
      }`}
    />
  );
};

export default PositionIndicator;
