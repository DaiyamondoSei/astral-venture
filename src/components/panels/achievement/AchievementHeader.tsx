
import React from 'react';
import { Trophy } from 'lucide-react';
import { useQuantumTheme } from '@/components/visual-foundation';
import GlassmorphicContainer from '@/components/visual-foundation/GlassmorphicContainer';

/**
 * Props for the AchievementHeader component
 */
interface IAchievementHeaderProps {
  unlockedCount: number;
  totalCount: number;
}

/**
 * Header component for the achievements panel, showing progress stats
 */
const AchievementHeader: React.FC<IAchievementHeaderProps> = ({ 
  unlockedCount, 
  totalCount 
}) => {
  const { theme } = useQuantumTheme();
  const variant = theme === 'default' ? 'quantum' : theme;
  
  return (
    <GlassmorphicContainer 
      variant={variant}
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
