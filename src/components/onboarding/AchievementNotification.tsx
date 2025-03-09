
import React from 'react';
import { motion } from 'framer-motion';
import { Award, X } from 'lucide-react';
import { IAchievementData } from './data/types';

interface AchievementNotificationProps {
  achievement: IAchievementData;
  onDismiss: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
  achievement, 
  onDismiss 
}) => {
  return (
    <motion.div 
      className="fixed bottom-4 right-4 z-50 max-w-sm bg-quantum-900/90 border border-quantum-500/30 rounded-lg shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <button 
        className="absolute top-2 right-2 p-1 text-white/70 hover:text-white"
        onClick={onDismiss}
      >
        <X size={14} />
      </button>
      
      <div className="flex p-4">
        <div className="mr-4 flex-shrink-0">
          <Award className="h-12 w-12 text-quantum-400" />
        </div>
        
        <div>
          <h4 className="font-semibold text-quantum-200">{achievement.title}</h4>
          <p className="text-sm text-white/70 mt-1">{achievement.description}</p>
          
          <div className="mt-2 flex items-center">
            <span className="text-xs font-semibold text-quantum-300">+{achievement.points} ENERGY POINTS</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementNotification;
