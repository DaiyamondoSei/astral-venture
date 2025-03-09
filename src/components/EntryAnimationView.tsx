
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import LoadingScreen from '@/components/LoadingScreen';
import OrbToAstralTransition from '@/components/OrbToAstralTransition';
import { 
  CosmicBackground, 
  GlassmorphicContainer 
} from '@/components/visual-foundation';

interface EntryAnimationViewProps {
  user: User | null;
  onComplete: () => void;
  showTestButton?: boolean;
}

const EntryAnimationView: React.FC<EntryAnimationViewProps> = ({
  user,
  onComplete,
  showTestButton = false
}) => {
  const [stage, setStage] = useState<'loading' | 'transition' | 'complete'>('loading');
  
  // Progress through the stages
  useEffect(() => {
    if (stage === 'loading') {
      // After loading is done, move to transition
      // This will be triggered by the LoadingScreen component's onLoadComplete
    } else if (stage === 'transition') {
      // The transition will automatically call onComplete when it finishes
    }
  }, [stage]);
  
  const handleLoadingComplete = () => {
    setStage('transition');
  };
  
  const handleTransitionComplete = () => {
    setStage('complete');
    onComplete();
  };
  
  // Skip directly to dashboard (for testing)
  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <CosmicBackground intensity="high" />
      
      {/* Current stage content */}
      {stage === 'loading' && (
        <LoadingScreen onLoadComplete={handleLoadingComplete} />
      )}
      
      {stage === 'transition' && (
        <motion.div 
          className="w-full h-full flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <OrbToAstralTransition onComplete={handleTransitionComplete} />
          
          {/* User welcome message */}
          <GlassmorphicContainer 
            className="px-8 py-4 mt-24 text-center"
            variant="quantum"
            intensity="medium"
            withGlow
          >
            <h2 className="text-xl font-medium text-white">
              {user ? `Welcome, ${user.email}` : 'Welcome, Explorer'}
            </h2>
            <p className="text-white/80 mt-2">
              Calibrating your quantum consciousness field...
            </p>
          </GlassmorphicContainer>
        </motion.div>
      )}
      
      {/* Test button for easier development */}
      {showTestButton && (
        <div className="absolute bottom-4 right-4 z-50">
          <Button onClick={handleSkip} variant="outline">
            Skip Animation
          </Button>
        </div>
      )}
    </div>
  );
};

export default EntryAnimationView;
