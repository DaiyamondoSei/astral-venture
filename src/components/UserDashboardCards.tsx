
import React from 'react';
import ProgressTracker from '@/components/ProgressTracker';
import { Sparkles } from 'lucide-react';

interface UserDashboardCardsProps {
  energyPoints: number;
  astralLevel: number;
  todayChallenge: any | null;
}

const UserDashboardCards = ({ energyPoints, astralLevel, todayChallenge }: UserDashboardCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="glass-card p-4">
        <h3 className="font-display text-lg mb-3">Energy Progress</h3>
        <ProgressTracker progress={energyPoints || 0} label="Energy Points" />
      </div>
      
      <div className="glass-card p-4">
        <h3 className="font-display text-lg mb-3">Today's Challenge</h3>
        {todayChallenge ? (
          <div>
            <p className="text-white/90 mb-2">{todayChallenge.title}</p>
            <div className="flex items-center text-sm">
              <Sparkles size={14} className="mr-1 text-primary" />
              <span>{todayChallenge.energy_points} energy points</span>
            </div>
          </div>
        ) : (
          <p className="text-white/70 text-sm">Complete your daily quantum challenge to advance</p>
        )}
      </div>
      
      <div className="glass-card p-4">
        <h3 className="font-display text-lg mb-3">Astral Level</h3>
        <div className="flex items-center">
          <div className="text-3xl font-display text-white mr-2">{astralLevel || 1}</div>
          <div className="text-white/70 text-sm">Awakened Seeker</div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardCards;
