import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import SeedOfLifeGeometry from './SeedOfLifeGeometry';
import PortalTransition from './PortalTransition';
import ConsciousnessView from './ConsciousnessView';
import { useSeedOfLifeInteraction } from '@/hooks/useSeedOfLifeInteraction';
import { useAuth } from '@/contexts/AuthContext';

interface SeedOfLifePortalProps {
  className?: string;
}

/**
 * The central Seed of Life Portal component
 * Serves as the main interaction point for users to access the consciousness view
 */
const SeedOfLifePortal: React.FC<SeedOfLifePortalProps> = ({ className }) => {
  const [isPortalActive, setIsPortalActive] = useState(false);
  const [showConsciousnessView, setShowConsciousnessView] = useState(false);
  const { user } = useAuth();
  
  // Get user profile data to determine level
  const userLevel = 1; // Default to level 1 if not available
  
  // Use the interaction hook for portal state management
  const { 
    portalEnergy, 
    resonanceLevel, 
    handlePortalInteraction 
  } = useSeedOfLifeInteraction(userLevel);
  
  // Handle portal click
  const handlePortalClick = useCallback(async () => {
    if (showConsciousnessView) return;
    
    if (portalEnergy >= 100) {
      // If portal is fully charged, activate it
      setIsPortalActive(true);
    } else {
      // Otherwise, increment energy
      await handlePortalInteraction();
    }
  }, [portalEnergy, handlePortalInteraction, showConsciousnessView]);
  
  // Handle transition completion
  const handleTransitionComplete = useCallback(() => {
    setShowConsciousnessView(true);
    setIsPortalActive(false);
  }, []);
  
  // Handle return from consciousness view
  const handleReturnFromConsciousness = useCallback(() => {
    setShowConsciousnessView(false);
  }, []);
  
  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PortalTransition 
        isActive={isPortalActive}
        onTransitionComplete={handleTransitionComplete}
      >
        {showConsciousnessView ? (
          <ConsciousnessView 
            onReturn={handleReturnFromConsciousness}
            userLevel={userLevel}
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <SeedOfLifeGeometry 
              energy={portalEnergy}
              resonanceLevel={resonanceLevel}
              size={280}
              onClick={handlePortalClick}
            />
            
            <motion.div 
              className="mt-4 text-center text-white/80 text-sm max-w-xs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p>
                {portalEnergy < 30 ? (
                  "Tap the Seed of Life to begin activating the portal"
                ) : portalEnergy < 70 ? (
                  "Continue tapping to increase portal energy"
                ) : portalEnergy < 100 ? (
                  "The portal is almost activated! Keep tapping..."
                ) : (
                  "Portal fully charged! Tap to enter your consciousness"
                )}
              </p>
              
              <div className="mt-2 text-xs text-white/60">
                Resonance Level: {resonanceLevel}
              </div>
            </motion.div>
          </div>
        )}
      </PortalTransition>
    </motion.div>
  );
};

export default SeedOfLifePortal;
