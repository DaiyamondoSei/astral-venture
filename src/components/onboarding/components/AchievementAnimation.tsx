
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';

interface AchievementAnimationProps {
  showAchievement: boolean;
}

const AchievementAnimation: React.FC<AchievementAnimationProps> = ({ showAchievement }) => {
  if (!showAchievement) return null;
  
  return (
    <AnimatePresence>
      {showAchievement && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center p-6 rounded-xl"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              transition: { type: "spring", bounce: 0.5, duration: 0.8 }
            }}
            exit={{ scale: 0, rotate: 10 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.2, 1],
                opacity: 1,
                transition: { delay: 0.3, duration: 0.5 }
              }}
            >
              <Award size={80} className="text-quantum-500" strokeWidth={1} />
            </motion.div>
            <motion.h3 
              className="mt-4 text-2xl font-bold text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
            >
              Journey Initiated!
            </motion.h3>
            <motion.p
              className="mt-2 text-white/80 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
            >
              You've completed the sacred geometry onboarding
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementAnimation;
