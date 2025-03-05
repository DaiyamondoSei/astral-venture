import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import StreakTracker from '@/components/StreakTracker';
import TodaysChallengeCard from '@/components/dashboard/TodaysChallengeCard';
import MostRecentPracticeCard from '@/components/dashboard/MostRecentPracticeCard';
import CategoryGrid from '@/components/dashboard/CategoryGrid';
import AIDashboardWidget from '@/components/ai-assistant/AIDashboardWidget';
import AIGuidedPractice from '@/components/ai-assistant/AIGuidedPractice';
import { getTodaysChallenge } from '@/services/challengeService';

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
  const [todayChallenge, setTodayChallenge] = useState(null);
  const [latestReflection, setLatestReflection] = useState<any>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadChallenge = async () => {
      if (user) {
        setLoadingChallenge(true);
        try {
          const challenge = await getTodaysChallenge(user.id);
          setTodayChallenge(challenge);
        } catch (error) {
          console.error('Error fetching today\'s challenge:', error);
        } finally {
          setLoadingChallenge(false);
        }
      }
    };

    loadChallenge();
  }, [user]);

  // Fetch latest reflection when component mounts
  useEffect(() => {
    if (user) {
      const fetchLatestReflection = async () => {
        try {
          const { data, error } = await supabase
            .from('energy_reflections')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (data && !error) {
            setLatestReflection(data);
          }
        } catch (error) {
          console.error('Error fetching latest reflection:', error);
        }
      };
      
      fetchLatestReflection();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {todayChallenge && (
          <div className="lg:col-span-2">
            <TodaysChallengeCard
              challenge={todayChallenge}
              onComplete={onChallengeComplete}
            />
          </div>
        )}
        
        {/* AI Dashboard Widget to make AI more prominent */}
        <AIDashboardWidget 
          latestReflection={latestReflection}
          onOpenAssistant={onOpenAiAssistant}
        />
        
        {/* AI Guided Practice widget */}
        <div className="lg:col-span-2">
          <AIGuidedPractice 
            practiceType="meditation"
            duration={5}
            chakraFocus={latestReflection?.chakras_activated?.[0]}
          />
        </div>
        
        {/* Keep other existing cards */}
        <div className="col-span-1">
          <MostRecentPracticeCard />
        </div>
      </div>
      
      {/* Keep existing content */}
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
