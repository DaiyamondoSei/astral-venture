
import React from 'react';
import { motion } from 'framer-motion';
import { CircleDot, Flame, ZapIcon } from 'lucide-react';

interface EnergyInfoCardProps {
  energyPoints: number;
  astralLevel: number;
  streakDays: number;
  progressPercentage: number;
}

const EnergyInfoCard: React.FC<EnergyInfoCardProps> = ({
  energyPoints,
  astralLevel,
  streakDays,
  progressPercentage
}) => {
  return (
    <div className="glass-card p-4">
      <h3 className="font-display text-lg mb-4">Cosmic Energy</h3>
      
      <div className="space-y-4">
        {/* Energy Points */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ZapIcon className="h-5 w-5 mr-2 text-primary" />
            <span className="text-white/80">Energy Points</span>
          </div>
          <div className="text-lg font-semibold">{energyPoints}</div>
        </div>
        
        {/* Level Progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <CircleDot className="h-5 w-5 mr-2 text-primary" />
              <span className="text-white/80">Astral Level</span>
            </div>
            <div className="text-lg font-semibold">{astralLevel}</div>
          </div>
          
          <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-quantum-400 to-quantum-700"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="text-xs text-right mt-1 text-white/60">
            {progressPercentage}% to Level {astralLevel + 1}
          </div>
        </div>
        
        {/* Streak Days */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Flame className="h-5 w-5 mr-2 text-orange-400" />
            <span className="text-white/80">Current Streak</span>
          </div>
          <div className="text-lg font-semibold">{streakDays} days</div>
        </div>
      </div>
    </div>
  );
};

export default EnergyInfoCard;
