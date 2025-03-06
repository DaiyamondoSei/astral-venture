
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle, X, Sparkles, Heart, Lightbulb } from 'lucide-react';
import { AchievementData } from './onboardingData';
import { Button } from '@/components/ui/button';

interface AchievementNotificationProps {
  achievement: AchievementData;
  onDismiss: () => void;
  userInteractions?: Array<{stepId: string, interactionType: string}>;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onDismiss,
  userInteractions = []
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [personalizedMessage, setPersonalizedMessage] = useState('');
  
  useEffect(() => {
    // Personalize message based on user interactions
    if (userInteractions.length > 0) {
      // Check if user has interacted with related content
      const hasExploredRelatedContent = userInteractions.some(
        interaction => interaction.stepId === achievement.requiredStep
      );
      
      if (hasExploredRelatedContent) {
        setPersonalizedMessage("You've shown great curiosity in this area!");
      }
      
      // Check if user completes steps quickly
      const interactionCount = userInteractions.length;
      if (interactionCount > 5) {
        setPersonalizedMessage("Your dedication to spiritual growth is impressive!");
      }
    }
    
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
  }, [userInteractions]);
  
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
        return <Sparkles className="h-12 w-12 text-blue-500" />;
      case 'meditation':
        return <Heart className="h-12 w-12 text-cyan-500" />;
      case 'reflection':
        return <Lightbulb className="h-12 w-12 text-emerald-500" />;
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
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-quantum-500/5 to-astral-500/5 rounded-lg"
              animate={{ 
                background: [
                  "radial-gradient(circle at center, rgba(136, 85, 255, 0.05) 0%, transparent 70%)",
                  "radial-gradient(circle at center, rgba(136, 85, 255, 0.1) 0%, transparent 70%)",
                  "radial-gradient(circle at center, rgba(136, 85, 255, 0.05) 0%, transparent 70%)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
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
                  
                  {personalizedMessage && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="text-sm text-quantum-300 mt-1 italic"
                    >
                      {personalizedMessage}
                    </motion.p>
                  )}
                  
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
