
import React from 'react';
import ProgressTracker from '@/components/ProgressTracker';

interface AchievementProgressTrackerProps {
  progressPercentage: number;
  totalPoints: number;
}

const AchievementProgressTracker: React.FC<AchievementProgressTrackerProps> = ({
  progressPercentage,
  totalPoints
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-64 p-4 bg-background/90 rounded-lg shadow-lg border border-quantum-500/30 backdrop-blur-sm">
      <h4 className="font-medium text-sm mb-2">Your Progress</h4>
      <ProgressTracker 
        progress={progressPercentage} 
        label={`${totalPoints} Energy Points`}
      />
    </div>
  );
};

export default AchievementProgressTracker;
