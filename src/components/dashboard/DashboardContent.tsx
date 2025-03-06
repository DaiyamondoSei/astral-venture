
import React from 'react';
import { useTodaysChallenge } from './hooks/useTodaysChallenge';
import { useLatestPractice } from './hooks/useLatestPractice';
import { useReflections } from './hooks/useReflections';
import TodaysChallenge from './presentation/TodaysChallenge';
import AIDashboardCard from './presentation/AIDashboardCard';
import AIGuidedPracticeCard from './presentation/AIGuidedPracticeCard';
import LatestPracticeCard from './presentation/LatestPracticeCard';
import CategoryGrid from './CategoryGrid';
import StreakTracker from '@/components/StreakTracker';

interface DashboardContentProps {
  userProfile: any;
  onChallengeComplete: (pointsEarned: number) => void;
  onCategorySelect: (category: string) => void;
  onOpenAiAssistant: (reflectionId?: string, reflectionContent?: string) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  userProfile,
  onChallengeComplete,
  onCategorySelect,
  onOpenAiAssistant
}) => {
  // Custom hooks for data fetching
  const { todayChallenge, loading: loadingChallenge, handleChallengeComplete } = useTodaysChallenge();
  const { latestReflection } = useReflections();
  const { latestPractice } = useLatestPractice();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Today's Challenge */}
        <div className="lg:col-span-2">
          <TodaysChallenge
            challenge={todayChallenge}
            isLoading={loadingChallenge}
            onComplete={(challengeId) => handleChallengeComplete(challengeId, onChallengeComplete)}
          />
        </div>
        
        {/* AI Dashboard Widget */}
        <div className="col-span-1">
          <AIDashboardCard 
            latestReflection={latestReflection}
            onOpenAssistant={onOpenAiAssistant}
          />
        </div>
        
        {/* AI Guided Practice widget */}
        <div className="lg:col-span-2">
          <AIGuidedPracticeCard 
            practiceType="meditation"
            duration={5}
            chakraFocus={latestReflection?.chakras_activated?.[0]}
          />
        </div>
        
        {/* Latest Practice Card */}
        <div className="col-span-1">
          <LatestPracticeCard latestPractice={latestPractice} />
        </div>
      </div>
      
      {/* Categories and Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-display text-lg mb-4">Energy Categories</h3>
          <CategoryGrid 
            userProfile={userProfile} 
            onSelectCategory={onCategorySelect}
          />
        </div>
        
        <div>
          <h3 className="font-display text-lg mb-4">Streaks & Progress</h3>
          <StreakTracker 
            currentStreak={3}
            longestStreak={7}
            activatedChakras={[0, 1, 3]}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
