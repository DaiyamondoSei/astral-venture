import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { FeatureTooltipData } from './data/types';

interface FeatureTooltipProps {
  tooltipData: FeatureTooltipData;
  onDismiss: () => void;
}

const FeatureTooltip: React.FC<FeatureTooltipProps> = ({ 
  tooltipData, 
  onDismiss 
}) => {
  const getPositionStyle = () => {
    switch (tooltipData.position) {
      case 'top':
        return { bottom: '100%', marginBottom: '10px', left: '50%', transform: 'translateX(-50%)' };
      case 'right':
        return { left: '100%', marginLeft: '10px', top: '50%', transform: 'translateY(-50%)' };
      case 'bottom':
        return { top: '100%', marginTop: '10px', left: '50%', transform: 'translateX(-50%)' };
      case 'left':
        return { right: '100%', marginRight: '10px', top: '50%', transform: 'translateY(-50%)' };
      default:
        return { top: '100%', marginTop: '10px', left: '50%', transform: 'translateX(-50%)' };
    }
  };

  return (
    <motion.div 
      className="fixed z-50 pointer-events-none"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        // Attempt to position relative to the target element
        ...getPositionStyle()
      }}
    >
      <div className="relative bg-quantum-900/90 border border-quantum-500/30 rounded-lg shadow-lg p-4 max-w-xs pointer-events-auto">
        <button 
          className="absolute top-2 right-2 p-1 text-white/70 hover:text-white"
          onClick={onDismiss}
        >
          <X size={14} />
        </button>
        
        <h4 className="font-medium text-white mb-1">{tooltipData.title}</h4>
        <p className="text-sm text-white/80">{tooltipData.description}</p>
      </div>
    </motion.div>
  );
};

export default FeatureTooltip;
