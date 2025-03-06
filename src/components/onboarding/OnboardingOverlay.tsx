
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '@/contexts/OnboardingContext';
import OnboardingContent from './OnboardingContent';
import SacredGeometryBackground from './components/SacredGeometryBackground';
import AchievementAnimation from './components/AchievementAnimation';
import ProgressBar from './components/ProgressBar';
import CloseButton from './components/CloseButton';
import NavigationControls from './components/NavigationControls';

// List of step IDs for easier reference
const ONBOARDING_STEPS = [
  'welcome',
  'sacred-geometry',
  'chakras',
  'energy-points',
  'meditation',
  'reflection',
  'complete'
];

const OnboardingOverlay: React.FC = () => {
  const { 
    isActive, 
    currentStep, 
    progress, 
    nextStep, 
    previousStep, 
    skipOnboarding,
    completeOnboarding,
    hasCompletedAnyStep
  } = useOnboarding();

  if (!isActive) return null;

  // Determine if we should show the achievement animation
  const showAchievement = currentStep === 'complete' && hasCompletedAnyStep;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          // Close on background click only on certain steps
          onClick={currentStep === 'welcome' ? skipOnboarding : undefined}
        >
          {/* Sacred geometry background patterns */}
          <SacredGeometryBackground />

          {/* Achievement animation */}
          <AchievementAnimation showAchievement={showAchievement} />

          <motion.div
            className="relative w-full max-w-2xl bg-background/95 backdrop-blur-md border border-quantum-500/20 rounded-lg shadow-xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <CloseButton onClose={skipOnboarding} />

            {/* Progress bar with micro-animation */}
            <ProgressBar 
              currentStep={currentStep} 
              progress={progress}
              steps={ONBOARDING_STEPS as any[]} 
            />

            {/* Content */}
            <div className="p-6 pt-8">
              <OnboardingContent step={currentStep} />
            </div>

            {/* Navigation controls with accessibility improvements */}
            <NavigationControls 
              currentStep={currentStep}
              onPrevious={previousStep}
              onNext={nextStep}
              onComplete={completeOnboarding}
              steps={ONBOARDING_STEPS as any[]}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingOverlay;
