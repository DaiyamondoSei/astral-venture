
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SeedOfLife } from '@/components/SeedOfLife';
import { ChevronRight } from 'lucide-react';
import { EntryAnimation } from '@/components/entry-animation/EntryAnimation';

export interface EntryAnimationViewProps {
  onComplete: () => void;
  showTestButton: boolean;
}

/**
 * A container for the entry animation that manages animation state
 * and provides a way to skip the animation.
 */
const EntryAnimationView: React.FC<EntryAnimationViewProps> = ({
  onComplete,
  showTestButton = false
}) => {
  const [animationStep, setAnimationStep] = useState<number>(0);
  const [skipped, setSkipped] = useState<boolean>(false);

  useEffect(() => {
    // Auto-complete the animation if skipped
    if (skipped) {
      onComplete();
    }
  }, [skipped, onComplete]);

  const handleSkip = () => {
    setSkipped(true);
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleTestNext = () => {
    if (animationStep < 3) {
      setAnimationStep(animationStep + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="relative w-full h-full min-h-screen flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <EntryAnimation
          step={animationStep}
          onStepComplete={() => setAnimationStep(animationStep + 1)}
          onComplete={handleComplete}
        />

        {/* Skip button */}
        <div className="absolute bottom-6 right-6 z-20">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={handleSkip}
          >
            Skip <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Test controls - only visible in development */}
        {showTestButton && (
          <div className="absolute bottom-6 left-6 z-20 flex gap-2">
            <Button
              variant="outline"
              className="bg-white/10 text-white hover:bg-white/20"
              onClick={handleTestNext}
            >
              Next Step
            </Button>
            <div className="px-3 py-2 bg-black/50 rounded text-white/70">
              Step: {animationStep}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default EntryAnimationView;
