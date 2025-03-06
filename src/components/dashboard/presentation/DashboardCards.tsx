
import React from 'react';
import { useLatestPractice } from '../hooks/useLatestPractice';
import { useReflections } from '../hooks/useReflections';
import { useTodaysChallenge } from '../hooks/useTodaysChallenge';
import LatestPracticeCard from './LatestPracticeCard';
import LatestReflectionCard from './LatestReflectionCard';
import TodaysChallenge from './TodaysChallenge';

/**
 * Dashboard cards that display latest activity information
 */
const DashboardCards: React.FC = () => {
  const { latestPractice, loading: practiceLoading } = useLatestPractice();
  const { latestReflection, loading: reflectionLoading } = useReflections();
  const { challenge, loading: challengeLoading } = useTodaysChallenge();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <LatestPracticeCard 
        latestPractice={latestPractice} 
        isLoading={practiceLoading} 
      />
      
      <TodaysChallenge 
        challenge={challenge} 
        isLoading={challengeLoading} 
      />
      
      <LatestReflectionCard 
        latestReflection={latestReflection} 
        isLoading={reflectionLoading} 
      />
    </div>
  );
};

export default DashboardCards;
