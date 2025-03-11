
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IAchievementData } from './hooks/achievement/types';
import { AchievementState } from './hooks/achievement';
import { DeviceCapability, detectDeviceCapability } from '@/utils/performanceUtils';
import { usePerformanceContext } from '@/contexts/PerformanceContext';

interface AchievementLayerProps {
  achievementState: AchievementState;
}

/**
 * AchievementLayer displays achievement notifications and manages their animations
 */
export const AchievementLayer: React.FC<AchievementLayerProps> = ({ 
  achievementState 
}) => {
  const { currentAchievement, dismissAchievement } = achievementState;
  const [isVisible, setIsVisible] = useState(false);
  const { deviceCapability } = usePerformanceContext();
  
  // Auto-dismiss after a delay
  useEffect(() => {
    if (currentAchievement) {
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        
        // Delay actual dismissal to allow exit animation
        setTimeout(() => {
          if (dismissAchievement) dismissAchievement();
        }, 500);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [currentAchievement, dismissAchievement]);
  
  // No achievement to display
  if (!currentAchievement) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <motion.div
            className="mt-4 pointer-events-auto"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 150 }}
          >
            <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-md border border-indigo-500/30 rounded-lg p-4 shadow-lg flex items-center">
              {/* Icon/Badge */}
              <div className="w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-full mr-4">
                <span className="text-xl text-white">🏆</span>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  Achievement Unlocked!
                </h3>
                <h4 className="text-md text-indigo-200 font-medium">
                  {currentAchievement.title}
                </h4>
                <p className="text-sm text-indigo-100">
                  {currentAchievement.description}
                </p>
                <div className="text-xs text-indigo-200 mt-1">
                  +{currentAchievement.points} points
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={() => setIsVisible(false)}
                className="ml-2 text-indigo-200 hover:text-white"
                aria-label="Dismiss achievement notification"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AchievementLayer;
