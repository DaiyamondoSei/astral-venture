
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle, X } from 'lucide-react';
import { AchievementData } from './onboardingData';
import { Button } from '@/components/ui/button';

interface AchievementNotificationProps {
  achievement: AchievementData;
  onDismiss: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Delay showing the achievement to allow for smoother animations
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    // Auto dismiss after 8 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 8000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, []);
  
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };
  
  // Map achievement icons to Lucide icon components
  const getAchievementIcon = () => {
    switch (achievement.icon) {
      case 'geometry':
        return <Award className="h-12 w-12 text-quantum-500" />;
      case 'chakra':
        return <Award className="h-12 w-12 text-purple-500" />;
      case 'energy':
        return <Award className="h-12 w-12 text-blue-500" />;
      case 'meditation':
        return <Award className="h-12 w-12 text-cyan-500" />;
      case 'reflection':
        return <Award className="h-12 w-12 text-emerald-500" />;
      case 'cosmic':
        return <Award className="h-12 w-12 text-quantum-400" />;
      default:
        return <Award className="h-12 w-12 text-quantum-500" />;
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 max-w-md"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          <div className="bg-gradient-to-br from-quantum-900/95 to-astral-900/95 backdrop-blur-md rounded-lg shadow-xl border border-quantum-500/20 overflow-hidden">
            <div className="relative p-4">
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
                aria-label="Close achievement notification"
              >
                <X size={16} />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm">
                  {getAchievementIcon()}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    Achievement Unlocked!
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <CheckCircle size={16} className="text-green-400" />
                    </motion.div>
                  </h3>
                  
                  <p className="font-medium text-white mt-1">{achievement.title}</p>
                  <p className="text-sm text-white/80 mt-1">{achievement.description}</p>
                  
                  <motion.div 
                    className="mt-2 text-quantum-300 text-sm font-medium flex items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <span>+{achievement.energyPointsReward} Energy Points</span>
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ delay: 1, duration: 0.5, repeat: 2, repeatDelay: 2 }}
                    >
                      ✨
                    </motion.div>
                  </motion.div>
                </div>
              </div>
              
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  variant="glass"
                  onClick={handleDismiss}
                  className="text-xs"
                >
                  Continue Your Journey
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementNotification;
