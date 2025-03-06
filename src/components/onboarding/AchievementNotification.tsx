
import React from 'react';
import { motion } from 'framer-motion';
import { Award, X } from 'lucide-react';
import { AchievementData } from './onboardingData';

interface AchievementNotificationProps {
  achievement: AchievementData;
  onDismiss: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onDismiss
}) => {
  // We'll define a default points reward if energyPointsReward doesn't exist
  const pointsReward = achievement.points || 0;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-sm bg-gradient-to-b from-background/95 to-background/80 border border-quantum-500/30 rounded-lg shadow-xl p-5"
        initial={{ scale: 0.8, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/40 hover:bg-background/70 text-foreground/70 hover:text-foreground"
          aria-label="Close achievement notification"
        >
          <X size={16} />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 1],
              opacity: 1,
              transition: { duration: 0.5 }
            }}
            className="bg-quantum-900/40 p-4 rounded-full mb-3"
          >
            <Award size={50} className="text-quantum-500" strokeWidth={1} />
          </motion.div>
          
          <motion.h3
            className="text-xl font-bold text-primary mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {achievement.title}
          </motion.h3>
          
          <motion.p
            className="text-muted-foreground text-sm mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {achievement.description}
          </motion.p>
          
          <motion.div
            className="bg-quantum-500/10 py-2 px-4 rounded-full text-sm font-medium text-quantum-300 mb-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            +{pointsReward} Energy Points
          </motion.div>
          
          <motion.button
            onClick={onDismiss}
            className="mt-2 py-2 px-6 bg-quantum-500/80 hover:bg-quantum-500 rounded-lg text-white font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Continue Journey
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AchievementNotification;
