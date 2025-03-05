
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Check, ChevronRight } from 'lucide-react';

interface VisualizationGuideProps {
  emotionalGrowth: number;
}

const VisualizationGuide: React.FC<VisualizationGuideProps> = ({ emotionalGrowth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // If user has dismissed the guide or has high emotional growth, don't show
  if (dismissed || emotionalGrowth > 85) return null;
  
  const toggleGuide = () => setIsOpen(!isOpen);
  
  const handleDismiss = () => {
    setIsOpen(false);
    setTimeout(() => setDismissed(true), 500);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };
  
  const getStepContent = () => {
    switch(currentStep) {
      case 1:
        return {
          title: "Understanding Your Energy Visualization",
          content: "The human silhouette represents your energy body. Brighter areas show activated energy centers."
        };
      case 2:
        return {
          title: "Chakra Activation",
          content: "Colored points are your chakras. Active chakras pulse more intensely based on your emotional state."
        };
      case 3:
        return {
          title: "Energy Flow",
          content: "The connecting lines show energy flow between your chakras. Stronger connections appear brighter."
        };
      case 4:
        return {
          title: "Emotional Resonance",
          content: "The background glow represents your overall emotional growth and dominant feelings."
        };
      default:
        return { title: "", content: "" };
    }
  };
  
  const stepContent = getStepContent();
  
  return (
    <>
      {/* Help toggle button - improved for accessibility */}
      <button
        onClick={toggleGuide}
        className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/50 border border-white/20 transition-colors hover:bg-black/70 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-quantum-400/50"
        aria-label={isOpen ? "Close visualization guide" : "Open visualization guide"}
      >
        <HelpCircle size={18} className="text-white/80" />
      </button>
      
      {/* Guide content with step-by-step walkthrough */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-x-4 top-12 z-20 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-5 text-sm shadow-xl"
            role="dialog"
            aria-labelledby="guide-title"
          >
            <div className="flex justify-between items-start mb-3">
              <h4 id="guide-title" className="font-display text-base text-white/95">{stepContent.title}</h4>
              <button 
                onClick={handleDismiss} 
                className="p-1 text-white/50 hover:text-white/90 focus:outline-none focus:text-white"
                aria-label="Close guide"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-start mb-2">
                <div className="mr-2 mt-0.5 text-quantum-400"><Check size={14} /></div>
                <p className="text-white/90 leading-relaxed">{stepContent.content}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
              <div className="text-xs text-white/60">
                Step {currentStep} of {totalSteps}
              </div>
              
              <button 
                onClick={nextStep}
                className="flex items-center py-1.5 px-3 bg-quantum-500/20 hover:bg-quantum-500/30 rounded text-sm font-medium text-white/90 border border-quantum-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-quantum-500/50"
              >
                {currentStep < totalSteps ? (
                  <>Next <ChevronRight size={14} className="ml-1" /></>
                ) : (
                  "Got it"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VisualizationGuide;
