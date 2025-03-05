
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Check, ChevronRight, Info, Star } from 'lucide-react';

interface VisualizationGuideProps {
  emotionalGrowth: number;
}

const VisualizationGuide: React.FC<VisualizationGuideProps> = ({ emotionalGrowth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // Show automatically for new users with low emotional growth
  useEffect(() => {
    if (emotionalGrowth < 30 && !dismissed && !isOpen) {
      // Small delay to let the visualization render first
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [emotionalGrowth, dismissed, isOpen]);
  
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
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const getStepContent = () => {
    switch(currentStep) {
      case 1:
        return {
          title: "Understanding Your Energy Visualization",
          content: "The human silhouette represents your energy body. Brighter areas show activated energy centers.",
          icon: <Info size={14} className="text-blue-300" />
        };
      case 2:
        return {
          title: "Chakra Activation",
          content: "Colored points are your chakras. Active chakras pulse more intensely based on your emotional state.",
          icon: <Star size={14} className="text-violet-300" />
        };
      case 3:
        return {
          title: "Energy Flow",
          content: "The connecting lines show energy flow between your chakras. Stronger connections appear brighter.",
          icon: <HelpCircle size={14} className="text-cyan-300" />
        };
      case 4:
        return {
          title: "Emotional Resonance",
          content: "The background glow represents your overall emotional growth and dominant feelings.",
          icon: <Star size={14} className="text-indigo-300" />
        };
      case 5:
        return {
          title: "Your Journey",
          content: "As you continue your practice, your visualization will evolve through five stages of consciousness.",
          icon: <Info size={14} className="text-emerald-300" />
        };
      default:
        return { title: "", content: "", icon: null };
    }
  };
  
  const stepContent = getStepContent();
  
  return (
    <>
      {/* Help toggle button - improved for accessibility */}
      <motion.button
        onClick={toggleGuide}
        className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/50 border border-white/20 transition-colors hover:bg-black/70 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-quantum-400/50"
        aria-label={isOpen ? "Close visualization guide" : "Open visualization guide"}
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          boxShadow: isOpen ? 'none' : [
            '0 0 0 rgba(138, 92, 246, 0)', 
            '0 0 8px rgba(138, 92, 246, 0.6)', 
            '0 0 0 rgba(138, 92, 246, 0)'
          ]
        }}
        transition={{ 
          duration: 0.2,
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            repeatType: "loop" as const
          }
        }}
      >
        <HelpCircle size={18} className="text-white/80" />
      </motion.button>
      
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
              <h4 id="guide-title" className="font-display text-base text-white/95 flex items-center">
                {stepContent.icon && <span className="mr-2">{stepContent.icon}</span>}
                {stepContent.title}
              </h4>
              <button 
                onClick={handleDismiss} 
                className="p-1 text-white/50 hover:text-white/90 focus:outline-none focus:text-white transition-colors"
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
            
            {/* Progress visualization */}
            <div className="w-full h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-quantum-500 to-quantum-400"
                initial={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
              <div className="text-xs text-white/60">
                Step {currentStep} of {totalSteps}
              </div>
              
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <button 
                    onClick={prevStep}
                    className="py-1.5 px-3 bg-white/5 hover:bg-white/10 rounded text-sm font-medium text-white/70 border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    Back
                  </button>
                )}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VisualizationGuide;
