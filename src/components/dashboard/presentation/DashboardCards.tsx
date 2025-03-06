
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LatestPracticeCard from './LatestPracticeCard';

interface DashboardCardsProps {
  latestPractice: any;
  isLoading: boolean;
  error: Error | null;
  todayChallenge?: any;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  latestPractice,
  isLoading,
  error,
  todayChallenge
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Challenges completed: {todayChallenge ? "1" : "0"}</p>
        </CardContent>
      </Card>
      
      <div>
        <LatestPracticeCard 
          latestPractice={latestPractice}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default DashboardCards;
