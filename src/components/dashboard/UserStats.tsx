
import React from 'react';
import CosmicAstralBody from '@/components/entry-animation/CosmicAstralBody';

interface UserStatsProps {
  energyPoints: number;
  streakDays: number;
  activatedChakras: number[];
}

const UserStats: React.FC<UserStatsProps> = ({
  energyPoints,
  streakDays,
  activatedChakras
}) => {
  return (
    <div className="mb-8">
      <CosmicAstralBody 
        energyPoints={energyPoints}
        streakDays={streakDays}
        activatedChakras={activatedChakras}
      />
    </div>
  );
};

export default UserStats;
