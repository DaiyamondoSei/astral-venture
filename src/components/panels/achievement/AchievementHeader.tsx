
import React from 'react';
import { Trophy } from 'lucide-react';
import { useQuantumTheme } from '@/components/visual-foundation';
import GlassmorphicContainer from '@/components/visual-foundation/GlassmorphicContainer';

interface AchievementHeaderProps {
  unlockedCount: number;
  totalCount: number;
}

const AchievementHeader: React.FC<AchievementHeaderProps> = ({ unlockedCount, totalCount }) => {
  const { theme } = useQuantumTheme();
  
  return (
    <GlassmorphicContainer 
      variant={theme === 'default' ? 'quantum' : theme}
      intensity="medium"
      withGlow={true}
      className="p-4 mb-4"
    >
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
          <Trophy size={20} />
        </div>
        <div>
          <h3 className="font-medium text-white text-lg">Achievements</h3>
          <p className="text-white/70 text-sm">
            {unlockedCount} unlocked of {totalCount} total
          </p>
        </div>
      </div>
    </GlassmorphicContainer>
  );
};

export default AchievementHeader;
