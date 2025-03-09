
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSeedOfLifeInteraction } from '@/hooks/useSeedOfLifeInteraction';
import SeedOfLifeGeometry from './SeedOfLifeGeometry';
import PortalTransition from './PortalTransition';
import ConsciousnessView from './ConsciousnessView';
import { cn } from '@/lib/utils';

interface SeedOfLifePortalProps {
  userLevel?: number;
  onActivate?: () => void;
  className?: string;
}

/**
 * Interactive Seed of Life portal that serves as the gateway to the consciousness view
 * Features energy accumulation through user interaction and visual feedback
 */
const SeedOfLifePortal: React.FC<SeedOfLifePortalProps> = ({
  userLevel = 1,
  onActivate,
  className
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showConsciousnessView, setShowConsciousnessView] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  
  // Use the seed of life interaction hook
  const {
    portalEnergy,
    resonanceLevel,
    handlePortalInteraction,
    resetInteraction
  } = useSeedOfLifeInteraction(userLevel);
  
  // Handle portal click - accumulate energy
  const handlePortalClick = useCallback(async () => {
    if (isTransitioning) return;
    
    setIsInteracting(true);
    const result = await handlePortalInteraction();
    
    // If energy is at 100%, trigger the portal activation
    if (result.newEnergy >= 100) {
      setIsTransitioning(true);
      onActivate?.();
      
      // After a delay, reset the portal for future use
      setTimeout(() => {
        resetInteraction();
      }, 2000);
    }
    
    setTimeout(() => {
      setIsInteracting(false);
    }, 300);
  }, [isTransitioning, handlePortalInteraction, onActivate, resetInteraction]);
  
  // Handle transition completion - show consciousness view
  const handleTransitionComplete = useCallback(() => {
    setIsTransitioning(false);
    setShowConsciousnessView(true);
  }, []);
  
  // Handle return from consciousness view
  const handleReturnFromConsciousness = useCallback(() => {
    setShowConsciousnessView(false);
  }, []);
  
  if (showConsciousnessView) {
    return (
      <ConsciousnessView
        userLevel={userLevel}
        onReturn={handleReturnFromConsciousness}
      />
    );
  }
  
  return (
    <>
      <motion.div
        className={cn(
          "relative flex items-center justify-center",
          className
        )}
        animate={{
          scale: isInteracting ? [1, 1.02, 1] : 1
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Energy field around the portal */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 240,
            height: 240,
            background: `radial-gradient(circle, rgba(138, 43, 226, ${
              0.05 + (portalEnergy / 100) * 0.2
            }) 0%, transparent 70%)`
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [
              0.6 + (portalEnergy / 100) * 0.4,
              0.8 + (portalEnergy / 100) * 0.2,
              0.6 + (portalEnergy / 100) * 0.4
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Interactive Seed of Life geometry */}
        <SeedOfLifeGeometry
          size={200}
          energy={portalEnergy}
          resonanceLevel={resonanceLevel}
          isActive={portalEnergy > 0}
          onClick={handlePortalClick}
        />
        
        {/* Resonance level indicator */}
        <div className="absolute bottom-0 translate-y-full mt-4 text-center text-white/70 text-sm">
          <span>Resonance Level: </span>
          <span className="text-purple-300 font-medium">{resonanceLevel}</span>
        </div>
      </motion.div>
      
      {/* Portal transition effect */}
      {isTransitioning && (
        <PortalTransition onComplete={handleTransitionComplete} />
      )}
    </>
  );
};

export default SeedOfLifePortal;
