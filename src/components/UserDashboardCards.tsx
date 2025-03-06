
import React from 'react';
import ProgressTracker from '@/components/ProgressTracker';
import { Sparkles, Calendar, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserDashboardCardsProps {
  energyPoints: number;
  astralLevel: number;
  todayChallenge: any | null;
}

const UserDashboardCards = ({ energyPoints, astralLevel, todayChallenge }: UserDashboardCardsProps) => {
  // Calculate progress percentage based on current level
  const getProgressPercentage = () => {
    const nextLevelThreshold = astralLevel * 100;
    const currentLevelThreshold = (astralLevel - 1) * 100;
    const pointsInCurrentLevel = energyPoints - currentLevelThreshold;
    const pointsNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;
    
    return Math.min(Math.round((pointsInCurrentLevel / pointsNeededForNextLevel) * 100), 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="glass-card p-4">
        <h3 className="font-display text-lg mb-3 flex items-center">
          <Sparkles size={16} className="mr-2 text-primary" />
          Energy Progress
        </h3>
        <ProgressTracker 
          progress={getProgressPercentage()} 
          label="Energy Points" 
          valuePrefix={`${energyPoints} / `}
          valueSuffix={` points`}
          animation="pulse"
          glowIntensity="medium"
        />
        
        <div className="mt-3 text-xs text-muted-foreground">
          {getProgressPercentage() >= 90 ? (
            <Badge variant="outline" className="bg-primary/20 border-primary/40">
              Almost at next level!
            </Badge>
          ) : (
            <span>{100 - getProgressPercentage()}% until level {astralLevel + 1}</span>
          )}
        </div>
      </div>
      
      <div className="glass-card p-4">
        <h3 className="font-display text-lg mb-3 flex items-center">
          <Calendar size={16} className="mr-2 text-primary" />
          Today's Challenge
        </h3>
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
        <h3 className="font-display text-lg mb-3 flex items-center">
          <Award size={16} className="mr-2 text-primary" />
          Astral Level
        </h3>
        <div className="flex items-center">
          <div className="text-3xl font-display text-white mr-2">{astralLevel || 1}</div>
          <div className="text-white/70 text-sm">
            {astralLevel <= 1 ? "Awakened Seeker" : 
             astralLevel <= 3 ? "Energy Adept" : 
             astralLevel <= 5 ? "Cosmic Voyager" : 
             "Quantum Master"}
          </div>
        </div>
        
        <div className="mt-2">
          <ProgressTracker 
            progress={getProgressPercentage()}
            size="sm"
            showValue={false}
            colorScheme={`from-quantum-${Math.min(astralLevel * 100, 800)} to-quantum-${Math.min(astralLevel * 100 + 200, 900)}`}
          />
        </div>
      </div>
    </div>
  );
};

export default UserDashboardCards;
