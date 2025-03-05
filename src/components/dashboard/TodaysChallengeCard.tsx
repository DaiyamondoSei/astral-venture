
import React from 'react';
import { Button } from '@/components/ui/button';

interface TodaysChallengeProps {
  challenge: any;
  onComplete: (pointsEarned: number) => void;
}

const TodaysChallengeCard: React.FC<TodaysChallengeProps> = ({ challenge, onComplete }) => {
  if (!challenge) return null;
  
  return (
    <div className="glass-card p-4">
      <h3>Today's Challenge: {challenge?.title || 'Loading...'}</h3>
      <p>{challenge?.description}</p>
      <Button onClick={() => onComplete(10)}>Complete Challenge</Button>
    </div>
  );
};

export default TodaysChallengeCard;
