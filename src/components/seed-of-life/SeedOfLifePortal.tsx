
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import SeedOfLifeGeometry from './SeedOfLifeGeometry';
import PortalTransition from './PortalTransition';
import ConsciousnessView from './ConsciousnessView';
import { useSeedOfLifeInteraction } from '@/hooks/useSeedOfLifeInteraction';
import { cn } from '@/lib/utils';
import { useQuantumTheme } from '@/components/visual-foundation';

interface SeedOfLifePortalProps {
  className?: string;
  initialActivated?: boolean;
  userLevel?: number;
  onActivate?: () => void;
}

/**
 * SeedOfLifePortal serves as the central interactive component in the app
 * It provides access to the user's consciousness journey and development
 */
const SeedOfLifePortal: React.FC<SeedOfLifePortalProps> = ({
  className,
  initialActivated = false,
  userLevel = 1,
  onActivate
}) => {
  const [isActivated, setIsActivated] = useState(initialActivated);
  const [showConsciousnessView, setShowConsciousnessView] = useState(false);
  const { theme, getPrimaryColor, getSecondaryColor } = useQuantumTheme();
  
  // Use custom hook for interaction handling and animations
  const { 
    handlePortalInteraction,
    portalEnergy,
    interactionCount,
    resonanceLevel,
    resetInteraction
  } = useSeedOfLifeInteraction(userLevel);
  
  // Get theme colors
  const primaryColor = getPrimaryColor();
  const secondaryColor = getSecondaryColor();
  
  // Handle click on the Seed of Life
  const handlePortalClick = useCallback(() => {
    // If already showing consciousness view, return
    if (showConsciousnessView) return;
    
    // If portal not yet activated, increment interaction
    if (!isActivated) {
      const { newEnergy, newResonance } = handlePortalInteraction();
      
      // Activate portal when energy reaches threshold
      if (newEnergy >= 100) {
        setIsActivated(true);
        onActivate?.();
      }
      return;
    }
    
    // If portal is activated, transition to consciousness view
    setShowConsciousnessView(true);
  }, [isActivated, showConsciousnessView, handlePortalInteraction, onActivate]);
  
  // Handle back navigation from consciousness view
  const handleBackFromConsciousness = useCallback(() => {
    setShowConsciousnessView(false);
    resetInteraction();
  }, [resetInteraction]);
  
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <AnimatePresence mode="wait">
        {!showConsciousnessView ? (
          <motion.div
            key="portal"
            className="relative flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Interactive Seed of Life */}
            <div 
              className={cn(
                "relative cursor-pointer transition-transform duration-300 transform hover:scale-105",
                isActivated ? "scale-110" : "scale-100"
              )}
              onClick={handlePortalClick}
            >
              <SeedOfLifeGeometry 
                size={isActivated ? 280 : 240}
                activated={isActivated}
                energy={portalEnergy}
                resonanceLevel={resonanceLevel}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                className="relative z-10"
              />
              
              {/* Energy halo effect */}
              {isActivated && (
                <motion.div
                  className="absolute inset-0 z-0 rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: [0.4, 0.7, 0.4], 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      `0 0 20px ${primaryColor}40`,
                      `0 0 40px ${primaryColor}60`,
                      `0 0 20px ${primaryColor}40`
                    ]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              )}
              
              {/* Sparkle indicators for interaction */}
              {!isActivated && interactionCount > 0 && (
                <motion.div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>
              )}
              
              {/* Activation indicator text */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 text-center">
                <p className="text-white/80 text-sm">
                  {isActivated 
                    ? "Tap to enter your consciousness journey" 
                    : `Tap to activate (${Math.min(100, Math.round(portalEnergy))}% energy)`}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="consciousness-view"
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Portal transition animation */}
            <PortalTransition onComplete={() => {}} />
            
            {/* Consciousness view */}
            <ConsciousnessView 
              userLevel={userLevel}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              onBack={handleBackFromConsciousness}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeedOfLifePortal;
