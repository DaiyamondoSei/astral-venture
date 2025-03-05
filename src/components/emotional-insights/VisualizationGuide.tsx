
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Check } from 'lucide-react';

interface VisualizationGuideProps {
  emotionalGrowth: number;
}

const VisualizationGuide: React.FC<VisualizationGuideProps> = ({ emotionalGrowth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  // If user has dismissed the guide or has high emotional growth, don't show
  if (dismissed || emotionalGrowth > 80) return null;
  
  const toggleGuide = () => setIsOpen(!isOpen);
  
  const handleDismiss = () => {
    setIsOpen(false);
    setTimeout(() => setDismissed(true), 500);
  };
  
  return (
    <>
      {/* Help toggle button */}
      <button
        onClick={toggleGuide}
        className="absolute top-3 right-3 z-20 p-1 rounded-full bg-black/40 border border-white/10 transition-colors hover:bg-black/60"
        aria-label={isOpen ? "Close visualization guide" : "Open visualization guide"}
      >
        <HelpCircle size={16} className="text-white/70" />
      </button>
      
      {/* Guide content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-x-4 top-12 z-20 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-sm text-white/90"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">Understanding Your Visualization</h4>
              <button onClick={handleDismiss} className="p-1 text-white/50 hover:text-white/90">
                <X size={14} />
              </button>
            </div>
            
            <ul className="space-y-2 my-2">
              <li className="flex items-start">
                <div className="mr-2 mt-0.5 text-quantum-400"><Check size={12} /></div>
                <p>The human silhouette represents your energy body. Brighter areas show activated energy centers.</p>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-0.5 text-quantum-400"><Check size={12} /></div>
                <p>Colored points are your chakras. Active chakras pulse more intensely.</p>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-0.5 text-quantum-400"><Check size={12} /></div>
                <p>The connecting lines show energy flow between your chakras. Stronger connections appear brighter.</p>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-0.5 text-quantum-400"><Check size={12} /></div>
                <p>The background glow represents your overall emotional growth and dominant feelings.</p>
              </li>
            </ul>
            
            <div className="text-xs text-white/60 mt-3">
              As your emotional growth advances, your visualization will transform to reflect higher states of consciousness.
            </div>
            
            <button 
              onClick={handleDismiss}
              className="mt-3 w-full py-1.5 bg-quantum-500/20 hover:bg-quantum-500/30 rounded text-xs font-medium text-white/90 border border-quantum-500/30 transition-colors"
            >
              Got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VisualizationGuide;
