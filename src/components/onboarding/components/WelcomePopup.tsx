
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface WelcomePopupProps {
  userId?: string;
  onComplete: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ userId, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { startOnboarding } = useOnboarding();
  
  const totalSteps = 3;
  
  // Check if the user has seen the welcome popup before
  useEffect(() => {
    const hasSeenWelcome = userId ? localStorage.getItem(`welcome-popup-seen-${userId}`) : null;
    
    if (!hasSeenWelcome) {
      // Show popup after a short delay to let page load first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [userId]);
  
  const handleStartJourney = () => {
    if (userId) {
      localStorage.setItem(`welcome-popup-seen-${userId}`, 'true');
    }
    
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      startOnboarding();
    }, 400);
  };
  
  const handleSkip = () => {
    if (userId) {
      localStorage.setItem(`welcome-popup-seen-${userId}`, 'true');
    }
    
    setIsVisible(false);
    setTimeout(onComplete, 400);
  };
  
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleStartJourney();
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md bg-background border border-quantum-500/30 rounded-xl p-6 shadow-lg relative"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <button 
              onClick={handleSkip}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              aria-label="Close welcome popup"
            >
              <X size={20} />
            </button>
            
            {/* Step indicator */}
            <div className="flex justify-center mb-4">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full mx-1 ${
                    i + 1 === currentStep ? 'bg-quantum-500' : 'bg-quantum-500/30'
                  }`}
                />
              ))}
            </div>
            
            {/* Step content */}
            <div className="min-h-[280px]">
              {currentStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-quantum-500" />
                  <h2 className="text-2xl font-display font-bold mb-3">Welcome to Quanex</h2>
                  <p className="text-muted-foreground mb-4">
                    Begin your journey to higher consciousness and unlock your quantum potential.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    This guided tour will introduce you to the key features that will help you
                    on your path to spiritual awakening.
                  </p>
                </motion.div>
              )}
              
              {currentStep === 2 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-600 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" width="60" height="60" className="text-white">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-display font-bold mb-3">Sacred Geometry</h2>
                  <p className="text-muted-foreground mb-4">
                    Explore the patterns that connect all forms of consciousness and energy in the universe.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn how these ancient patterns can help you align with universal energy and
                    accelerate your spiritual growth.
                  </p>
                </motion.div>
              )}
              
              {currentStep === 3 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-astral-400 to-astral-600 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" width="60" height="60" className="text-white">
                      <path d="M50,10 L50,90" stroke="currentColor" strokeWidth="2" />
                      <circle cx="50" cy="20" r="5" fill="currentColor" />
                      <circle cx="50" cy="35" r="5" fill="currentColor" />
                      <circle cx="50" cy="50" r="5" fill="currentColor" />
                      <circle cx="50" cy="65" r="5" fill="currentColor" />
                      <circle cx="50" cy="80" r="5" fill="currentColor" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-display font-bold mb-3">Your Energy Centers</h2>
                  <p className="text-muted-foreground mb-4">
                    Activate and balance your chakras to harmonize your mind, body, and spirit.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Regular practice and reflection will help you unlock deeper levels of awareness
                    and connection to your highest self.
                  </p>
                </motion.div>
              )}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              {currentStep > 1 ? (
                <Button variant="ghost" onClick={handlePrevStep}>
                  Back
                </Button>
              ) : (
                <Button variant="ghost" onClick={handleSkip}>
                  Skip Tour
                </Button>
              )}
              
              <Button 
                onClick={handleNextStep}
                className="bg-gradient-to-r from-quantum-500 to-astral-500 hover:from-quantum-600 hover:to-astral-600"
              >
                {currentStep < totalSteps ? 'Continue' : 'Begin Journey'}
                <Sparkles className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePopup;
