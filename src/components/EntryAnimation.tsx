
import React from 'react';

type EntryAnimationState = 'orb' | 'transition' | 'human' | 'complete';

interface EntryAnimationProps {
  initialState?: EntryAnimationState;
  onComplete?: () => void;
  autoStart?: boolean;
}

const EntryAnimation: React.FC<EntryAnimationProps> = ({
  initialState = 'orb',
  onComplete,
  autoStart = false
}) => {
  // This is a simplified version for now
  return (
    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full animate-pulse">
      {/* Simplified animation placeholder */}
    </div>
  );
};

export default EntryAnimation;
